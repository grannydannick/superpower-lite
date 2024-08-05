import { ArrowUpRight } from 'lucide-react';

export const ReportRoute = () => {
  return (
    <div>
      <section id="report-header">
        <div>
          <div>
            <p>Jan 8, 2024</p>
            <h1>Jacob&apos;s Annual Report</h1>
          </div>
          <div>
            <img
              src="/src/assets/practitioners/dr_jonathan_richina.png"
              alt="Dr. Jonathan Richina"
            />
            <p>Dr. Jonathan Richina</p>
          </div>
        </div>
        <div>
          <div />
        </div>
      </section>
      <div>
        <div>
          <h2>Overview</h2>
          <p>Overall you&apos;re looking quite health.</p>
        </div>
        <div>
          <div></div>
          <div>
            <p>Access further testing</p>
            <ArrowUpRight />
          </div>
        </div>
      </div>
      <ScoreDrawer />
      <ScoreItem />
    </div>
  );
};

const ScoreDrawer = () => {
  return <></>;
};

const ScoreItem = () => {
  return <></>;
};
