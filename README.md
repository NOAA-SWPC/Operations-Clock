# Operations Clock

[Operations Clock (github hosted webpage)](https://noaa-swpc.github.io/Operations-Clock/)

## History

This clock was originally developed for the National Hurricane Center in 2004, and has become popular in operations centers, especially in FEMA and the National Weather Service.

## Instructions

To launch the clock, either launch locally or via a webserver one of these html files. For best appearance, full screen the browser.
Make sure the computer running the web browser has a system clock in sync with the atomic clock.

One popular complete clock solution is to set up a raspberry pi connected to a monitor and boot it into a full screen browser with this clock. See [PiClockSetup.md](PiClockSetup.md) instructions for example.

## Clocks

* utc-lcl.html (preferred)
* zulu.html
* universal.html
* local.html
* universal-local.html
* countdown.html

index.html points to utc-lcl.html as the preferred clock, but any of the other clocks can be used.

The utc-lcl clock can be customized with your specific local timezone in the bottom left using the settings.js file.  Samples are provided for eastern and central timezones in the [settings.js](settings.js) file and under [config](config) directory. Currently only local tz images available for EST, EDT, CST, CDT.  More images can be made for other timezones.

The countdown clock must be configured with a date in the [settings.js](settings.js) file. See sample in settings file or under [config](config).

