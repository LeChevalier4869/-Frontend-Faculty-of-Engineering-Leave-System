import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiEndpoints } from "../utils/api";

export default function HolidayCalendar() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchHolidays() {
      setLoading(true);
      try {
        const response = await axios.get(apiEndpoints.getHoliday, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        if (response.data?.data) {
          setHolidays(response.data.data);
        } else {
          setHolidays([]);
        }
      } catch (error) {
        console.error("Failed to fetch holidays:", error);
        setHolidays([]);
      }
      setLoading(false);
    }

    fetchHolidays();
  }, []);

  return (
    <div>
      <h2>ปฏิทินวันหยุด</h2>
      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : holidays.length === 0 ? (
        <p>ไม่มีข้อมูลวันหยุด</p>
      ) : (
        <ul>
          {holidays.map(({ id, date, description, holidayType }) => (
            <li key={id} title={`${description} (${holidayType})`}>
              {new Date(date).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              - {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
