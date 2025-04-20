"use client";

import { Calendar, DatePicker } from "@convoform/ui";

export default function Playground() {
  return (
    <div>
      <h1>Playground</h1>
      <div className="p-4">
        <DatePicker
          onSelect={(d) => console.log(d)}
          disabled={{
            from: new Date(2021, 12, 21),
            to: new Date(2021, 12, 30),
          }}
        />
        <Calendar
          selected={new Date("Tue Mar 04 2025 00:00:00 GMT+0530")}
          mode="single"
        />
      </div>
    </div>
  );
}
