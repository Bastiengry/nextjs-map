import { ReactNode, useState, useEffect } from "react";

let currentControls: any[] = [];
let listeners: Array<(c: any[]) => void> = [];

const notify = () => listeners.forEach((fn) => fn([...currentControls]));

export const useMap = () => ({
  addControl: (control: any) => {
    currentControls.push(control);
    notify(); // Warns the MapContainer that there is a new control to display
  },
  removeControl: (control: any) => {
    currentControls = currentControls.filter((c) => c !== control);
    notify();
  },
});

export const useMapEvents = jest.fn((handlers?: any) => {
  (useMapEvents as any)._lastHandlers = handlers;

  return {
    addControl: (control: any) => {
      currentControls.push(control);
      notify(); // Warns the MapContainer that there is a new control to display
    },
    removeControl: (control: any) => {
      currentControls = currentControls.filter((c) => c !== control);
      notify();
    },
    locate: jest.fn(),
    flyTo: jest.fn(),
    getZoom: jest.fn(() => 13),
  };
}) as any;

export const MapContainer = ({ children }: { children: ReactNode }) => {
  const [controls, setControls] = useState<any[]>([]);

  useEffect(() => {
    listeners.push(setControls);
    setControls([...currentControls]);

    return () => {
      listeners = listeners.filter((l) => l !== setControls);
    };
  }, []);

  return (
    <div data-testid="map-container">
      {children}
      {controls.map((control, i) => (
        <div
          key={i}
          ref={(node) => {
            if (node && node.innerHTML === "") {
              const domEl = control.onAdd();
              node.appendChild(domEl);
            }
          }}
        />
      ))}
    </div>
  );
};

export const __resetMocks = () => {
  currentControls = [];
  listeners = [];
};
