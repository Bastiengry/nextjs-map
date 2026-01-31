"use client";

import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { useRef } from "react";
import { loginWithGoogle } from "../../actions/auth";
import { signOut, useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";

/**
 * Header.
 *
 * This is located at the top of the application.
 */
export default function Header() {
  const { t } = useTranslation();
  const { data: session } = useSession();

  const connectionMenuRef = useRef<Menu>(null);
  const connectionMenuItems = [
    {
      label: session ? `Hi, ${session.user?.name}` : t("header.account"),
      items: session
        ? [
            {
              label: t("header.disconnect"),
              icon: "pi pi-power-off",
              command: () => {
                signOut({ callbackUrl: "/" });
              },
            },
          ]
        : [
            {
              label: t("header.connectWithGoogle"),
              icon: "pi pi-google",
              command: async () => {
                await loginWithGoogle();
              },
            },
          ],
    },
  ];

  return (
    <div aria-label="top-header" className="p-menubar flex flex-col">
      <div className="flex-1 flex">
        <div className="flex-none">
          <img
            alt="logo"
            src="https://primefaces.org/cdn/primereact/images/logo.png"
            height={40}
            width={40}
          ></img>
        </div>
        <div className="flex-1 flex justify-center">
          <h1 className="text-3xl font-extrabold">NextJS Map</h1>
        </div>
        <div className="flex-none">
          <Menu
            model={connectionMenuItems}
            popup
            ref={connectionMenuRef}
            id="popup_menu_right"
            popupAlignment="right"
          />
          <Button
            icon="pi pi-user"
            aria-label="header-user-btn"
            size="small"
            text
            severity="secondary"
            onClick={(event) => connectionMenuRef.current?.toggle(event)}
            aria-controls="popup_menu_right"
            aria-haspopup
          />
        </div>
      </div>
    </div>
  );
}
