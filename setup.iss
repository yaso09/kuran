[Setup]
AppName=Kur'an-ı Kerim
AppVersion=1.0.0
DefaultDirName={pf}\Kuran
DefaultGroupName=Kur'an-ı Kerim
OutputDir=dist
OutputBaseFilename=Kuran_Kurulum
SetupIconFile=www\muslim-icon_quran.ico
UninstallDisplayIcon={app}\kuran.exe
Compression=lzma2
SolidCompression=yes
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64

[Files]
Source: "dist\kuran\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Kur'an-ı Kerim"; Filename: "{app}\kuran.exe"
Name: "{commondesktop}\Kur'an-ı Kerim"; Filename: "{app}\kuran.exe"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Masaüstü kısayolu oluştur"; GroupDescription: "Ek görevler:"
