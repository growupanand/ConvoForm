"use client";
import { DatePicker } from "@convoform/ui";

import { useState } from "react";

export default function Playground() {
  const [_date, _setDate] = useState<Date>();
  return (
    <div>
      <h1>Playground</h1>
      <div className="p-4 space-y-4">
        <DatePicker onSelect={console.log} showTimePicker />
        <DatePicker onSelect={console.log} />
      </div>
    </div>
  );
}
