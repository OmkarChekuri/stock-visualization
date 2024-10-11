// src/utils/Draggable.js

export class Draggable {
  dragElement(elmnt) {
    if (elmnt == null) {
      return; // Do nothing if element is not present
    }

    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;

    const dragMouseDown = (e) => {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    };

    const elementDrag = (e) => {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      elmnt.style.top = elmnt.offsetTop - pos2 + 'px';
      elmnt.style.left = elmnt.offsetLeft - pos1 + 'px';
    };

    const closeDragElement = () => {
      /* Stop moving when mouse button is released */
      document.onmouseup = null;
      document.onmousemove = null;
    };

    // Add event listener to handle the dragging from either the header or the element itself
    if (document.getElementById(elmnt.id)) {
      /* If present, move the DIV from the header */
      document.getElementById(elmnt.id).onmousedown = dragMouseDown;
    } else {
      /* Otherwise, move the DIV from anywhere inside the DIV */
      elmnt.onmousedown = dragMouseDown;
    }
  }
}
