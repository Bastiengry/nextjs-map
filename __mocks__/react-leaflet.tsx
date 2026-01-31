import React from "react";
import {
  ReactNode,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";

let currentControls: any[] = [];
let listeners: Array<(c: any[]) => void> = [];

const notify = () => listeners.forEach((fn) => fn([...currentControls]));

const mapControlMethods = {
  addControl: jest.fn((control: any) => {
    currentControls.push(control);
    notify();
  }),
  removeControl: jest.fn((control: any) => {
    currentControls = currentControls.filter((c) => c !== control);
    notify();
  }),
  invalidateSize: jest.fn(),
  setView: jest.fn(),
  fitBounds: jest.fn(),
  flyTo: jest.fn(),
  locate: jest.fn(),
  getZoom: jest.fn(() => 13),
  panTo: jest.fn(),
};

export const useMap = () => mapControlMethods;

export const useMapEvents = jest.fn((handlers?: any) => {
  (useMapEvents as any)._lastHandlers = handlers;
  return mapControlMethods;
}) as any;

export const MapContainer = forwardRef(
  (
    {
      children,
      whenCreated,
    }: {
      children: ReactNode;
      whenCreated?: (map: any) => void;
    },
    ref: any,
  ) => {
    const [controls, setControls] = useState<any[]>([]);

    // UNE SEULE instance de map
    const mapInstance = mapControlMethods;

    // ✅ Support du ref (même si RL ne l’utilise pas)
    useImperativeHandle(ref, () => mapInstance, []);

    // ✅ Support officiel React-Leaflet
    useEffect(() => {
      if (whenCreated) {
        whenCreated(mapInstance);
      }
    }, [whenCreated]);

    useEffect(() => {
      listeners.push(setControls);
      setControls([...currentControls]);

      return () => {
        listeners = listeners.filter((l) => l !== setControls);
      };
    }, []);

    useEffect(() => {
      React.Children.forEach(children, (child: any) => {
        if (child?.props?.onReady) {
          child.props.onReady(mapInstance);
        }
      });
    }, [children]);

    return (
      <div aria-label="map-container">
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
  },
);

export const Polyline = (props: any) => {
  // Simulates a Leaflet instance
  const leafletPolyline = {
    setLatLngs: jest.fn(),
  };

  // Support of callback ref
  if (typeof props.ref === "function") {
    props.ref(leafletPolyline);
  }

  return (
    <div
      aria-label={props["aria-label"]}
      data-positions={JSON.stringify(props.positions)}
      onClick={(e) => props.eventHandlers?.click?.(e)}
      onContextMenu={(e) => {
        props.eventHandlers?.contextmenu?.({
          originalEvent: e,
          latlng: { lat: 0, lng: 0 },
        });
      }}
    >
      {props.children}
    </div>
  );
};

export const Marker = (props: any) => {
  let isDragging = false;

  return (
    <div
      aria-label={props["aria-label"]}
      data-position={JSON.stringify(props.position)}
      onContextMenu={(e) => {
        e.stopPropagation();
        props.eventHandlers?.contextmenu?.({
          originalEvent: e,
        });
      }}
      onMouseDown={() => {
        isDragging = true;
        props.eventHandlers?.dragstart?.();
      }}
      onMouseMove={() => {
        if (!isDragging) return;
        props.eventHandlers?.drag?.({
          target: {
            getLatLng: () => ({ lat: 50, lng: 5 }),
          },
        });
      }}
      onMouseUp={() => {
        if (!isDragging) return;
        isDragging = false;
        props.eventHandlers?.dragend?.();
      }}
    >
      {props.children}
    </div>
  );
};

export const __resetMocks = () => {
  currentControls = [];
  listeners = [];
  Object.values(mapControlMethods).forEach((method: any) => {
    if (method._isMockFunction) {
      method.mockClear();
    }
  });
};
