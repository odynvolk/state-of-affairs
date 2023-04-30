import { useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";

export default function Panel(props) {
  const [imageSrcs, setImageSrcs] = useState(
    props.subjects.map(({ subject }) =>
      `/api/chart?subject=${subject}&timeline=7`
    ),
  );

  async function updateChart(timeline: number) {
    setImageSrcs(
      props.subjects.map(({ subject }) =>
        `/api/chart?subject=${subject}&timeline=${timeline}`
      ),
    );
  }

  return (
    <>
      <div className="p-4 mx-auto max-w-screen-md flex justify-center panel">
        <Button onClick={() => updateChart(7)}>1 week</Button>
        <Button onClick={() => updateChart(30)}>1 month</Button>
        <Button onClick={() => updateChart(90)}>3 months</Button>
        <Button onClick={() => updateChart(365)}>YTD</Button>
        <Button onClick={() => updateChart(365 * 3)}>3 years</Button>
        <Button onClick={() => updateChart(365 * 10)}>Max</Button>
      </div>
      <div className="p-4 mx-auto max-w-screen-md">
        {props.subjects.map(({ subject }: string, i: number) => {
          return (
            <img
              src={imageSrcs[i]}
              className={`mx-auto my-4 h-96 chart-${subject}`}
              alt={subject}
            />
          );
        })}
      </div>
    </>
  );
}
