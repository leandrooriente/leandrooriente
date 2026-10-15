---
layout: "layouts/article.njk"
templateEngineOverride: njk,md
permalink: "/writing/one-battlestation-two-computers.html"
title: "Two Macs, one monitor: a USB switch and DDC"
deck: "Sharing my desk between two Macs, with a USB switch and DDC to make the monitor follow."
description: "How I share one desk between a MacBook Pro and a Mac mini, using a USB switch, a small Swift helper, and DDC/CI to switch the monitor automatically."
summary: "Sharing a monitor, keyboard, and mouse between two Macs, with automatic monitor input switching through DDC/CI."
publicationYear: 2026
order: 0
illustration: "/assets/illustrations/battlestation-editorial-v2.png"
illustrationAlt: "A hand presses one switch to share a monitor, split keyboard, and mouse between a laptop and a small desktop computer."
---

I use a MacBook Pro for work, and I bought a [CalDigit TS4 dock](https://www.caldigit.com/thunderbolt-station-4/) to connect everything on my desk. The peripherals, network, monitor, and power all reach the MacBook through a single Thunderbolt cable. When I need to take it out, I just unplug that one cable and leave the rest of the battlestation connected.

{% battlestationDiagram "before", "battlestation-before" %}

That worked well while I had one computer. After buying a Mac mini, I needed a way to use the same desk with both Macs.

I could move the Thunderbolt cable between them whenever I wanted to switch, but that kind of sucks.

Buying a second keyboard, mouse, webcam, and audio setup wouldn’t work. I have limited space on my desk, and I’m not willing to duplicate everything I have.

Moving the dock would also complicate my private VLAN and static-IP configuration, which I wanted to keep stable.

So I bought a [USB switch](https://uk.ugreen.com/products/75087-amz) to share the peripherals. Pressing its button moves the USB devices from one computer to the other, allowing me to switch without moving the dock’s Thunderbolt cable.

The monitor still needed a separate action. My MacBook connects to the monitor through DisplayPort, while the Mini uses HDMI 2. After switching the peripherals, I had to use the monitor’s controls to select the corresponding input.

{% battlestationDiagram "after", "battlestation-after" %}

I already had to press the USB switch, so manually toggling the monitor looked quite dumb.

## Making the monitor follow

The monitor supports **DDC**, short for Display Data Channel. Its [command interface, DDC/CI](https://glenwing.github.io/docs/VESA-DDCCI-1.1.pdf), allows software to control supported monitor settings over the display connection. That includes selecting an input, which made this automation possible.

Both Macs already run [BetterDisplay](https://betterdisplay.pro/), which can [send those input-selection commands](https://betterdisplay.pro/guide/interface-reference/app-menu/device-menu/input-source/). I just needed to know when to send them.

The USB switch doesn’t provide an interface to detect when I press its button. I had to detect the change myself. The obvious place to look was a USB device I’m unlikely to disconnect during normal use.

My keyboard provided that signal. When I press the switch, the keyboard disconnects from one Mac and appears on the other. Its arrival tells the receiving computer that the peripherals have moved to it.

I built a [small Swift helper](https://github.com/leandrooriente/display-switch) that runs on each Mac and listens for that connection event. After a brief delay to let the USB connection settle, it asks BetterDisplay to select that computer’s monitor input through DDC/CI.

The helper responds only to arrivals. Disconnections cancel pending actions, so unplugging a Mac doesn’t itself send an input-change command.

The helper runs automatically in the background. I added commands to [Raycast](https://www.raycast.com/), a macOS app launcher, so I could control it without opening a terminal. From there, I can enable or pause the automation, check its status, and test whether the keyboard is being detected.

Sleep and wake needed one more adjustment. I enabled automatic input selection on the monitor, so it changes inputs when a Mac wakes.

Now I can switch my entire workstation to a different computer with the touch of a button.

And nothing makes a lazy developer happier than spending a night fixing a problem that takes a second every day.
