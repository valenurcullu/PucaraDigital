import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createDemoExperienceReader,
  type MemberExperience,
} from '@pucara/shared';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: MemberExperience };
interface ExperienceContextValue {
  state: LoadState;
  reload: () => void;
}
const ExperienceContext = createContext<ExperienceContextValue | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => {
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
        if (!controller.signal.aborted) setState({ status: 'ready', data });
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
  const value = useMemo(() => ({ state, reload }), [state, reload]);
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
