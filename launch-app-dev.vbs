Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the current directory
currentDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Change to the application directory
objShell.CurrentDirectory = currentDir

' Check if node_modules exists
If Not objFSO.FolderExists("node_modules") Then
    ' Install dependencies if needed
    MsgBox "Installing dependencies. This may take a few moments...", vbInformation, "Two Dimensional Reserving"
    objShell.Run "cmd /c npm install", 1, True
End If

' Run npm start silently
objShell.Run "cmd /c npm start", 0, False