# RazerControl

This is a GUI, which resides in your menubar. The icon is a razor-blade, which is - as you may guess - a intended pun. It uses the amazing work of [kprinssu](https://github.com/kprinssu/osx-razer-blade) which then has been forked by [dylanparker](https://github.com/dylanparker/osx-razer-led), who added the command line functionallity. My software then executes the needed shell commands.

![User Interface](readme_images/userinterface.png)

## Installation

Please check out the releases section of this repo, you can find binaries in the OSX app format there. Place it into your application folder and set it as a login item in system preferences > users & groups > login items, if you want to.

## Future plans

- [x] Fix first window draw delay (preload)
- [x] Add a visual for sending commands
- [x] Make the settings persistent over re-launch
- [x] Keeping the right order in dropdown item list
- [x] Fix slider positioning (length)
- [x] Add terminate button
- [ ] Implement update notifier
- [x] Package this as an OSX app
- [x] Automatically download needed binary from repo
- [x] Migrate downloading of all kinds from wget to curl
- [ ] Look into per key lighting, seems kind of hard tho
