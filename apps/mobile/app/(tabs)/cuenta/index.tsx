import { ExperienceScreen } from '../../../components/member-ui';
import { AccountHome } from '../../../features/account/screens';
export default function Cuenta() {
  return (
    <ExperienceScreen tab showDemoNotice={false}>
      {(data) => <AccountHome data={data} />}
    </ExperienceScreen>
  );
}
