import React from "react";
import {SwitchItem} from "@vizality/components/settings";

export default ({getSetting, toggleSetting}) => <SwitchItem
	note="Immediately tries to recover from crash."
	value={getSetting("immediately", false)}
	onChange={() => toggleSetting("immediately")}
>Immediately Recover</SwitchItem>;