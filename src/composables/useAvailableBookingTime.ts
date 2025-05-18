import { api } from "boot/axios";

export const fetchAvailableBookingTimeSlots = async ({
  date,
  staffId,
  duration,
}: {
  date: string;
  staffId: number;
  duration: number;
}) => {
  try {
    let url = "/api/get-unavailable-time-from-date";
    if (staffId !== 0) {
      url = "/api/get-unavailable-time-from-staff";
    }

    const response = await api.get(url, {
      params: {
        date,
        staff_id: staffId,
      },
    });

    if (response.data.no_schedule) {
      return [];
    }

    const minTime = response.data.start_time;
    const maxTime = response.data.end_time;
    const unavailable_booking_time = response.data.unavailable_time;

    const allTimes: string[] = [];
    const startTime = new Date(`1970-01-01T${minTime}:00`);
    const endTime = new Date(`1970-01-01T${maxTime}:00`);
    const timeIncrement = 10;

    for (
      let time = new Date(startTime);
      time <= endTime;
      time.setMinutes(time.getMinutes() + timeIncrement)
    ) {
      allTimes.push(time.toTimeString().slice(0, 5));
    }

    // 过滤不可预约时间段
    const availableTimes = allTimes.filter((time) => {
      const startTime = time + ":00";
      let endHour = parseInt(time.split(":")[0]) + Math.floor(duration / 60);
      let endMinute = parseInt(time.split(":")[1]) + (duration % 60);
      if (endMinute >= 60) {
        endMinute -= 60;
        endHour += 1;
      }
      const endTime =
        `${endHour.toString().padStart(2, "0")}:${endMinute
          .toString()
          .padStart(2, "0")}` + ":00";

      return !unavailable_booking_time.some((timeRange) => {
        return (
          (startTime >= timeRange.start_time &&
            startTime < timeRange.end_time) ||
          (endTime > timeRange.start_time && endTime <= timeRange.end_time) ||
          (startTime < timeRange.start_time &&
            endTime > timeRange.end_time) ||
          endTime > maxTime + ":00"
        );
      });
    });

    return availableTimes;
  } catch (error) {
    console.error("Error fetching time slots:", error);
    throw error;
  }
};
