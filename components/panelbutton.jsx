import {joinClassNames} from "@vizality/util/dom";
import React from "react";

export default function PanelButton({label, icon, onClick, disabled}) {
	return <div onClick={() => !disabled && onClick()} className={joinClassNames("errorBoundary-panelButton", disabled && "disabled")}>
		<div className="iconContainer">{icon}</div>
		<div className="buttonText">{label}</div>
	</div>
}