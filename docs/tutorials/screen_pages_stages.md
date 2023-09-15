ScreenPage has few different loading stages:

1. constructor() - the default class stage is called once right after page registered in the app. \
nothing special happens here.

2. register() - here {@link SystemInterface}, with {@link SystemSettings} as systemSettings, {@link SystemAudioInterface} as audio and {@link SystemSocketConnection} as network are attached to the {@link ScreenPage}. \
This is a place where assets should be added: {@tutorial assets_manager}, {@tutorial how_to_add_and_use_audio}

3. init() - is called only after SystemInterface.startScreenPage() is called, this stage called only once pear game. Assets, which were added at register(2) stage, will be already loaded and ready to use here.

4. start() - is called right after init() stage. If the page will be stopped with SystemInterface.stopScreenPage() and then restarted again it will be called without init() on second start.

All methods above can be overwritten.