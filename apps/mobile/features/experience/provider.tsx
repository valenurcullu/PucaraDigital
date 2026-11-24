import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  createDemoExperienceReader,
  type MemberExperience,
} from '@pucara/shared';

import { previewPadel, type DemoPadelIntent } from '../padel/demo-session';
type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: MemberExperience };
interface ExperienceContextValue {
  state: LoadState;
  reload: () => void;
  preview: (intent: DemoPadelIntent, expected: MemberExperience) => boolean;
}
const ExperienceContext = createContext<ExperienceContextValue | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const snapshot = useRef<MemberExperience | null>(null);
  const preview = useCallback(
    (intent: DemoPadelIntent, expected: MemberExperience) => {
      if (snapshot.current !== expected) return false;
      const next = previewPadel(expected, intent);
      if (!next) return false;
      snapshot.current = next;
      setState({ status: 'ready', data: next });
      return true;
    },
    [],
  );
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => {
    snapshot.current = null;
    setState({ status: 'loading' });
    setRevision((value) => value + 1);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    // One read per session/retry, shared by all tabs. No fake network or writes.
    Promise.resolve()
      .then(() =>
        createDemoExperienceReader(process.env.EXPO_PUBLIC_DATA_MODE).read(
          controller.signal,
        ),
      )
      .then((data) => {
        if (!controller.signal.aborted) {
          snapshot.current = data;
          setState({ status: 'ready', data });
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setState({
            status: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'No pudimos cargar el contenido.',
          });
      });
    return () => controller.abort();
  }, [revision]);
  const value = useMemo(
    () => ({ state, reload, preview }),
    [state, reload, preview],
  );
  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
}
export function useExperience() {
  const value = useContext(ExperienceContext);
  if (!value) throw new Error('ExperienceProvider no disponible');
  return value;
}
