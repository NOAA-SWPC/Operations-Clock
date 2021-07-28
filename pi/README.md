# Raspberry Pi Standalone Clock Example Setup Instructions

Initally the information on booting the pi to a full-screen browser was taken from this page: http://blogs.wcode.org/2013/09/howto-boot-your-raspberry-pi-into-a-fullscreen-browser-kiosk/, but has been modified for our use.

## Step 1: Download and Install Raspbian
For the most part, we’ve used a stock basic Raspbian lite image, updated to the latest versions; but we’ve then installed several additional packages:

**Required**
* matchbox - simple window manager
* midori - preferred low-resource web browser
* x11-xserver-utils - xserver tools for dpms, etc.
* xserver-xorg-legacy - added due to recent upgrades in raspbian xserver and issues running startx as pi user.
* libnss3 - secure connections library
* apache2 - if running web browser remotely
* ntp - to sync clock time at boot
* git - to clone this repo
* vim - any favorite text editor

**Optional**
* xwit - to modify cursor
* unclutter - another way to hide the mouse
* chromium - modern browser option
* sqlite3 - for chromium setup
* ttf-mscorefonts-installer - for displaying customized fonts

Run these commands after you have flashed your microSD card and booted up into raspbian (modify for your optional packages above):
```console
sudo apt-get update 
sudo apt-get dist-upgrade 
sudo apt-get install matchbox midori x11-xserver-utils xserver-xorg-legacy libnss3 apache2 ntp git vim
sudo reboot
```

### Allow pi user to run startx console
Add pi user to tty group:
```console
sudo usermod -a -G tty pi
```
Due to security restriction enforced by default, edit /etc/X11/Xwrapper.config and change allowed_users from console to anybody.

### Set to boot in console mode
Under System Options > Boot / Auto Login in raspi-config
```console
sudo raspi-config
```

## Step 2: Setup Time Sync with NTP
It is essential to make sure your pi boots with proper time and is synced to a reliable time server.  If you have internet connectivity, this should be pretty seamless to an atomic clock.  If not, your pi can be synced to a local time server, even a Windows Time Server.  Be sure to set your timeserver configuration in /etc/ntp.conf.

To force ntp sync at boot (pi has no battery), place some commands at the bottom of /etc/rc.local:
```sh
# SYNC CLOCK AT BOOT
/etc/init.d/ntp stop
ntpd -q -g
/etc/init.d/ntp start
```

## Step 3: Choose Clock Code
The clock can be used locally from a web server on the pi, or remotely from a central website.
### Local Web
Clone the clock directory under /var/www and customize to your preferences.
```console
cd /var/www/html
sudo git clone https://github.com/NOAA-SWPC/Operations-Clock
```
### Remote Central Web
Point to website elsewhere on your network or use https://noaa-swpc.github.io/Operations-Clock from the web in Step 5 below.

## Step 4: Screen Resolution

This is usually the trickiest part of the install and depends on your monitor for optimal settings.  There is a manual option and an automatic resolution option.  Given the nature of the full clock display, getting the reolution to fit the monitor and use up the full screen appropriately may require using a resolution that is not the monitor's default.  Be careful using the automatic resolution option, although it should be fine on higher resolution 1080p+ monitors.

### Manual Resolution
It usually is best to set the resolution, especially on smaller lower-res screens. 1920x1080 works well, but depending on your screen this can be adjusted. Some screens may even require overscan enabled to get it just right.

```sh
# 1920x1080 at 32bit depth, Auto mode
disable_overscan=1
framebuffer_width=1920
framebuffer_height=1080
framebuffer_depth=32
framebuffer_ignore_alpha=1
hdmi_pixel_encoding=1
hdmi_group=0
```

### Automatic Resolution

Results may vary with older low-res monitors, but this can be useful if you want to have one pi install image for different monitors of higher resolutions.

This is the strategy: set the internal framebuffer to as large as it can be, then detect the monitor’s capabilities and adjust. If you know exactly what resolution your monitor is, just tweak the config.txt file and skip the rest of this step!

So, first set the framebuffer up by adding this to /boot/config.txt:
```sh
# 1920x1080 at 32bit depth, Auto mode
disable_overscan=1
framebuffer_width=1920
framebuffer_height=1080
framebuffer_depth=32
framebuffer_ignore_alpha=1
hdmi_pixel_encoding=1
hdmi_group=0
```
Next, add this to /etc/rc.local; it waits for a monitor to be attached to the HDMI socket, probes it for its preferred mode, sets that preferred mode and finally resets the framebuffer ready for X to takeover:
```sh
# Wait for the TV-screen to be turned on...
while ! $( tvservice --dumpedid /tmp/edid | fgrep -qv 'Nothing written!' ); do
  bHadToWaitForScreen=true;
  printf "===> Screen is not connected, off or in an unknown mode, waiting for it to become available...\n"
  sleep 10;
 done;
 printf "===> Screen is on, extracting preferred mode...\n"
 _DEPTH=32;
 eval $( edidparser /tmp/edid | fgrep 'preferred mode' | tail -1 | sed -Ene 's/^.+(DMT|CEA) \(([0-9]+)\) ([0-9]+)x([0-9]+)[pi]? @.+/_GROUP=\1;_MODE=\2;_XRES=\3;_YRES=\4;/p' );
 printf "===> Resetting screen to preferred mode: %s-%d (%dx%dx%d)...\n" $_GROUP $_MODE $_XRES $_YRES $_DEPTH
 tvservice --explicit="$_GROUP $_MODE"
 sleep 1;
 printf "===> Resetting frame-buffer to %dx%dx%d...\n" $_XRES $_YRES $_DEPTH
 fbset --all --geometry $_XRES $_YRES $_XRES $_YRES $_DEPTH -left 0 -right 0 -upper 0 -lower 0;
 sleep 1;
```

## Step 5: Launching Browser

### /boot/xinitrc
Create the /boot/xinitrc file using web source from Step 3 above:
```sh
#!/bin/sh

while true
do
  # Clean up previously running apps, gracefully at first then harshly
  killall -TERM midori 2>/dev/null;
  killall -TERM matchbox-window-manager 2>/dev/null;
  sleep 2;
  killall -9 midori 2>/dev/null;
  killall -9 matchbox-window-manager 2>/dev/null;

  # Clean out existing profile information
  rm -rf /home/pi/.cache;
  rm -rf /home/pi/.config;
  rm -rf /home/pi/.pki;

  # Disable DPMS / Screen blanking
  xset -dpms
  xset s off

  # Start the window manager (remove "-use_cursor no" if you actually want mouse interaction)
  matchbox-window-manager -use_titlebar no -use_cursor no &

  # Start the browser
  # for local web clock
  midori -e Fullscreen http://localhost/Operations-Clock/
  # for central clock
  #midori -e Fullscreen https://noaa-swpc.github.io/Operations-Clock
done
```
#### Alternative Options
The above script should be all that is needed for the xinitrc file, but here are some options listed for reference.

**Browser** - 
If you prefer to use the chromium browser (appears to use more resources for this simple task), here is some code to optimize it in the xinitrc script:
```sh
# Generate the bare minimum to keep Chromium happy!
mkdir -p /home/pi/.config/chromium/Default
sqlite3 /home/pi/.config/chromium/Default/Web\ Data "CREATE TABLE meta(key LONGVARCHAR NOT NULL UNIQUE PRIMARY KEY, value LONGVARCHAR); INSERT INTO meta VALUES('version','46'); CREATE TABLE keywords (foo INTEGER);";

# for local web clock
#chromium --app=http://localhost/Operations-Clock/
# for central clock
#chromium --app=https://noaa-swpc.github.io/Operations-Clock
```

**Mouse Tips** - 
Simple "-use_cursor no" should work on matchbox, but here are more cursor hiding options for reference.

*Use unclutter if just want to hide inactive cursor:*
```console
sudo apt-get install unclutter
```
*Other mouse hiding options:*
```sh
# Reset the framebuffer colour-depth
fbset -depth $( cat /sys/module/*fb*/parameters/fbdepth );
# Hide the cursor (move it to the bottom-right, comment out if you want mouse interaction)
xwit -root -warp $( cat /sys/module/*fb*/parameters/fbwidth ) $( cat /sys/module/*fb*/parameters/fbheight )
```

### /etc/rc.local
With that all done, the installation needs to be told to start-up X using the tailored xinitrc (kept on the boot-partition so that it can easily be edited on a non-Linux machine) by adding the following to the bottom of /etc/rc.local:
```sh
if [ -f /boot/xinitrc ]; then
  ln -fs /boot/xinitrc /home/pi/.xinitrc;
  su - pi -c 'startx' &
fi
```

## Step 6: Fine-tune
Adjust the html image sizes and screen setting in /boot/config.txt to the needs of your monitor/clock.

That is all. Reboot your Pi and it should start X and launch Midori into your clock web page in full screen mode!
