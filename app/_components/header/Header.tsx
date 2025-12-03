import { Menubar } from "primereact/menubar";

export interface HeaderProps {
  setCurrentEditAction: (action: string) => void;
}

export default function Header({ setCurrentEditAction }: HeaderProps) {
  const logo = (
    <img
      alt="logo"
      src="https://primefaces.org/cdn/primereact/images/logo.png"
      height={40}
      width={40}
      className="mr-2"
    ></img>
  );

  const menuItems = [
    {
      label: "Home",
      icon: "pi pi-home",
    },
    {
      label: "Draw",
      icon: "pi pi-pen-to-square",
      items: [
        {
          label: "Add Marker",
          icon: "pi pi-bolt",
          command: () => setCurrentEditAction("add_marker"),
        },
      ],
    },
  ];

  return <Menubar model={menuItems} start={logo} />;
}
