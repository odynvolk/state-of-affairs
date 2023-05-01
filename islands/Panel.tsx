import { useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";

export default function Panel(props) {
  const [subjects, setSubjects] = useState([]);
  const [timeline, setTimeline] = useState(7);

  async function selectSubject(selectedSubject) {
    const selectedSubjects = subjects.slice();
    if (selectedSubjects.includes(selectedSubject)) {
      setSubjects(selectedSubjects.filter((s) => s !== selectedSubject));
    } else {
      selectedSubjects.push(selectedSubject);
      setSubjects(selectedSubjects);
    }
  }

  return (
    <>
      <div className="p-4 mx-auto max-w-screen-md flex justify-center panel-timeline">
        <Button onClick={() => setTimeline(7)}>1 week</Button>
        <Button onClick={() => setTimeline(30)}>1 month</Button>
        <Button onClick={() => setTimeline(90)}>3 months</Button>
        <Button onClick={() => setTimeline(365)}>YTD</Button>
        <Button onClick={() => setTimeline(365 * 3)}>3 years</Button>
        <Button onClick={() => setTimeline(365 * 10)}>Max</Button>
      </div>
      <div className="p-4 mx-auto max-w-screen-md flex justify-center panel-subjects">
        {props.subjects.map(({ subject }: string, i: number) => {
          return (
            <Button onClick={() => selectSubject(subject)} subject={subject}>
              {subject}
            </Button>
          );
        })}
        <Button onClick={() => selectSubject()}>All</Button>
      </div>
      <div className="p-4 mx-auto max-w-screen-md">
        {subjects.map((subject: string, i: number) => {
          return (
            <img
              src={`/api/chart?subject=${subject}&timeline=${timeline}&colour=${
                props.charts_colour[i]
              }`}
              className={`mx-auto my-4 h-96 chart-${subject}`}
              alt={`Chart of ${subject} sentiment`}
            />
          );
        })}
      </div>
    </>
  );
}
