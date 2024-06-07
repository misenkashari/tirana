import "./App.css";
import { Timeline, Typography } from "antd";
import { useState, useEffect, useRef } from "react";
import Vakt from "./components/Vakt";
import KaabaIcon from "./components/KaabaIcon";

function App() {
  const [times, setTimes] = useState([]);
  const [location, setLocation] = useState({
    city: "Tirana",
    country: "Albania",
  });
  const [targetPrayer, setTargetPrayer] = useState(null);
  const [targetPrayerTimeRemaining, setTargetPrayerTimeRemaining] =
    useState("");
  const [showKaabaIcon, setShowKaabaIcon] = useState(true);
  const intervalRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const translations = {
      Fajr: "Sabahu",
      Sunrise: "Lindja e Diellit",
      Dhuhr: "Dreka",
      Asr: "Ikindia",
      Sunset: "Perëndimi i Diellit",
      Maghrib: "Akshami",
      Isha: "Jacia",
      Imsak: "Imsaku",
      Midnight: "Mesnata",
      Firstthird: "1/3 e parë e Natës",
      Lastthird: "1/3 e fundit e Natës",
    };

    fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=${location.city}&country=${location.country}&method=8`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.data.timings === null) return;

        const obj = data.data.timings;

        const vakts = Object.entries(obj).map(([key, value]) => {
          return {
            key: key,
            title: translations[key],
            time: getTodayAtTime(value),
          };
        });

        console.log(vakts);

        setTimes(vakts);
        const nextPrayer = findNextPrayer(vakts);
        setTargetPrayer(nextPrayer);
        setTargetPrayerTimeRemaining(calculateTimeRemaining(nextPrayer.time));
        setLoading(false);
      });
  }, [location]);

  useEffect(() => {
    if (!targetPrayer) return;

    const updateRemainingTime = () => {
      const newTimeRemaining = calculateTimeRemaining(targetPrayer.time);
      setTargetPrayerTimeRemaining(newTimeRemaining);
    };

    updateRemainingTime();

    intervalRef.current = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(intervalRef.current);
  }, [targetPrayer]);

  useEffect(() => {
    if (showKaabaIcon) {
      const iconTimer = setTimeout(() => setShowKaabaIcon(false), 1000);
      return () => clearTimeout(iconTimer);
    }
  }, [showKaabaIcon]);

  const calculateTimeRemaining = (targetTime) => {
    const now = new Date();
    const diff = targetTime - now;
    if (diff < 0) return "Vakti ka hyre...";

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const getTodayAtTime = (timeString) => {
    const today = new Date();
    const [hours, minutes] = timeString.split(":").map(Number);
    today.setHours(hours, minutes, 0, 0);

    return today;
  };

  const findNextPrayer = (prayerTimes) => {
    const now = new Date();
    const farz = ["Sabahu", "Dreka", "Ikindia", "Akshami", "Jacia"];
    let indexSabah = 0;
    for (const vakt of prayerTimes) {
      if (vakt.title === "Sabahu") indexSabah = prayerTimes.indexOf(vakt);
      if (farz.includes(vakt.title) && vakt.time > now) return vakt;
    }
    return prayerTimes[indexSabah];
  };

  return (
    <>
      {loading ? (
        <p>Loading prayer times...</p>
      ) : (
        <div>
          <Typography.Title level={2}>
            Kohët e faljes Tiranë,{" "}
            {new Date().toLocaleString().split(",").slice(0, 1)}
          </Typography.Title>
          <br /> <br />
          <Timeline
            items={times.map((vakt) => {
              const isTargetPrayer = vakt.key === targetPrayer?.key;
              return {
                dot: isTargetPrayer ? <KaabaIcon /> : null,
                children: (
                  <Vakt
                    prayer={vakt.title}
                    time={vakt.time
                      .toLocaleTimeString()
                      .split(":")
                      .slice(0, 2)
                      .join(":")}
                    timeRemaining={
                      isTargetPrayer ? targetPrayerTimeRemaining : null
                    }
                  />
                ),
              };
            })}
          />
        </div>
      )}
    </>
  );
}

export default App;
