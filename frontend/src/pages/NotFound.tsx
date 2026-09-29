import { Link } from 'react-router-dom';
import { Button, Panel } from '../components/ui/primitives';
import { IconArrowRight, IconMap } from '../components/ui/icons';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Panel className="max-w-lg p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ice-100 text-blue-600">
          <IconMap width={22} height={22} />
        </div>
        <div className="eyebrow">Error 404</div>
        <h1 className="mt-2 text-xl font-bold text-navy-900">This view does not exist.</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          The address you followed is not part of the Nirikshan forecast-reliability interface. Head back to the
          operations dashboard or the product introduction.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link to="/dashboard">
            <Button variant="primary">
              Operations dashboard <IconArrowRight width={15} height={15} />
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary">Product introduction</Button>
          </Link>
        </div>
      </Panel>
    </div>
  );
}
