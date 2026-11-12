import { MemberScreen, NavRow, StateView } from '../components/member-ui';
export default function NotFound() {
  return (
    <MemberScreen>
      <StateView
        title="No encontramos esta página"
        description="El enlace puede haber cambiado. Volvé al Inicio para seguir."
      />
      <NavRow title="Ir al Inicio" href="/" />
    </MemberScreen>
  );
}
