import React from "react";
import {SwitchItem, SliderInput} from "@vizality/components/settings";
import {ErrorBoundary} from "@vizality/components";

export default ({getSetting, toggleSetting, updateSetting}) => <ErrorBoundary>
	<SwitchItem
		note="Immediately tries to recover from crash."
		value={getSetting("immediately", false)}
		onChange={() => toggleSetting("immediately")}
	>Immediately Recover</SwitchItem>
	<SwitchItem
		note="This option starts automatically the recover process. It doesn't work with Delay setting."
		value={getSetting("auto", true)}
		onChange={() => toggleSetting("auto")}
	>Automatically start recovering</SwitchItem>
	<SliderInput
		note="Set's the delay (in seconds) between crash and recover. Will be disabled with 'Immediately Recover'"
		disabled={getSetting("immediately", false)}
		stickToMarkers={true}
		onValueChange={value => updateSetting("delay", value)}
		defaultValue={3}
		minValue={0}
		maxValue={100}
		keyboardStep={1}
		handleSize={10}
		initialValue={getSetting("delay", 3)}
		markers={Array.from(new Array(10)).map((_, i) => i + 1)}
	>Delay between recovering</SliderInput>
	<SliderInput
		note="Set the amount how often it should automatically try to recover."
		disabled={!getSetting("auto", true)}
		stickToMarkers={true}
		onValueChange={value => updateSetting("times", value)}
		defaultValue={5}
		minValue={0}
		maxValue={100}
		keyboardStep={1}
		handleSize={10}
		initialValue={getSetting("times", 5)}
		markers={Array.from(new Array(10)).map((_, i) => i + 1)}
	>Automatically tries</SliderInput>
</ErrorBoundary>;