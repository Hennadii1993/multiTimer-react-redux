import FullTimer from "./components/SingleTimer/FullTimer";
import Searchbar from "./components/SearchBar/SearchBar";
import React, { useEffect, useState } from "react";
import Button from '@material-ui/core/Button';
import Swal from "sweetalert2";
import "./index.css";

export default function App() {
  const [timerList, setTimerList] = useState(getStorage());
  const [InputFilter, setInputFilter] = useState("");
  const [showTrashKey, setShowTrashKey] = useState(false);

  function getStorage() {
    let timerStorage = localStorage.getItem("timerList");
    if (!timerStorage || timerStorage === []) return [];
    var res = JSON.parse(timerStorage.toString()).filter((t) => t.status !== 2)
    return res;
  }

  async function createTimer() {
    await Swal.fire({
      title: "Enter timer's name",
      input: "text",
      inputValidator: (value) => {
        if (!value) return "You need to write something!";
      },
    }).then((result) => {
      if (!result.value) return;
      setTimerList((timerList) => [
        ...timerList,
        {
          timeoutSeconds: 0,
          id: `${result.value} ${timerList.length}`,
          expiryTimestamp: 0,
          status: 1,
        },
      ]);
    });
  }

  function timeChange(timer, seconds) {
    let newList = [...timerList];
    const timerIndex = newList.findIndex((obj) => {
      return obj.id === timer.id;
    });
    newList[timerIndex].timeoutSeconds = seconds;
    setTimerList(newList);
  }

  function sortTimerList(sortMethod) {
    let sorted = "";
    switch (sortMethod) {
      case "A-Z":
        sorted = [...timerList].sort((a, b) => a.id.localeCompare(b.id));
        break;
      case "Z-A":
        sorted = [...timerList].sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "time-up":
        sorted = [...timerList].sort(
          (a, b) => a.timeoutSeconds - b.timeoutSeconds
        );
        break;
      case "time-down":
        sorted = [...timerList].sort(
          (a, b) => b.timeoutSeconds - a.timeoutSeconds
        );
        break;
      default:
        return null;
    }
    setTimerList(sorted);
  }

  function removeTimer(timer) {
    Swal.fire({
      title: 'Are you sure?',
      text: showTrashKey === false ? 'Remove to Recycle Bin!' : "Delete Permanantly!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        var temList = [];
        timerList.forEach(ele => {
          if (ele.id === timer.id) {
            if (ele.status === 1) {
              ele.status = 0;
            } else {
              ele.status = 2;
            }
          }
          temList.push(ele)
        });
        setTimerList(temList)
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        return;
      }
    });
  }

  function showTrash() {
    setShowTrashKey(!showTrashKey)
  }

  useEffect(() => {
    localStorage.setItem("timerList", JSON.stringify(timerList));
  }, [timerList]);

  return (
    <div id="main">
      <Searchbar
        createTimer={() => createTimer()}
        changeInputFilter={(event) => setInputFilter(event)}
        sortList={(sortMethod) => sortTimerList(sortMethod)}
      />
      <div
        id="liveTimerCont"
        style={{ "display": showTrashKey === false ? "block" : "none" }}>
        {timerList
          .filter((t) => t.status === 1)
          .map((timer) => (
            <FullTimer
              key={timer.id}
              id={timer.id}
              isHidden={
                !timer.id
                  .substring(0, timer.id.lastIndexOf(" "))
                  .toLocaleLowerCase()
                  .includes(InputFilter.toLocaleLowerCase())
              }
              expiryTimestamp={timer.expiryTimestamp}
              removeTimer={() => removeTimer(timer)}
              updateTimeoutSeconds={(seconds) => timeChange(timer, seconds)}
            />
          ))}
      </div>

      <div
        id="delTimerCont"
        style={{ "display": showTrashKey === true ? "block" : "none" }}>
        {timerList
          .filter((t) => t.status === 0)
          .map((timer) => (
            <FullTimer
              key={timer.id}
              id={timer.id}
              isHidden={
                !timer.id
                  .substring(0, timer.id.lastIndexOf(" "))
                  .toLocaleLowerCase()
                  .includes(InputFilter.toLocaleLowerCase())
              }
              expiryTimestamp={timer.expiryTimestamp}
              removeTimer={() => removeTimer(timer)}
              updateTimeoutSeconds={(seconds) => timeChange(timer, seconds)}
            />
          ))}
      </div>
      <Button
        variant="contained"
        color="primary"
        id="bin_btn"
        onClick={() => showTrash()}
      >
        {showTrashKey === false ? "Recycle Bin" : "Go back!"}
      </Button>
    </div>
  );
};