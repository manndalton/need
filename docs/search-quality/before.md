# Search Quality: Before State

Captured: 2026-03-17

## Tool Descriptions & Examples

### ripgrep
**Description:** Search tool like grep and The Silver Searcher
**Usage examples:**
- Search for a pattern in the current directory recursively
- Search for a pattern in specific file types only
- Search with context lines and case-insensitive matching

### wget
**Description:** Internet file retriever
**Usage examples:**
- Download a single file from a URL
- Download a file and save it with a different name
- Recursively download an entire website directory

### curl
**Description:** Get a file from an HTTP, HTTPS or FTP server
**Usage examples:**
- Download a file from a URL
- Make a POST request with JSON data
- Download a file following redirects with progress bar

### imagemagick
**Description:** Tools and libraries to manipulate images in select formats
**Usage examples:**
- Convert an image from one format to another
- Resize an image to specific dimensions
- Get detailed information about an image

### ffmpeg
**Description:** Play, record, convert, compress, and stream audio and video. Compress video without losing quality, convert formats, extract audio, and process media files.
**Usage examples:**
- Convert video format from MP4 to WebM
- Extract audio from video as MP3
- Get detailed information about a media file
- Compress video file while preserving quality with H.264
- Reduce video file size without losing quality

### jq
**Description:** Lightweight and flexible command-line JSON processor. Pretty print JSON, parse and query JSON data, filter and transform JSON on the command line.
**Usage examples:**
- Pretty-print JSON from a file
- Extract a specific field from JSON
- Filter array of objects by condition
- Pretty print JSON data in terminal with colors
- Pretty print and format JSON files on command line
- Parse, query and pretty print JSON from APIs

### fd
**Description:** Simple, fast and user-friendly tool to find files by name. A fast alternative to the find command for searching files by name, pattern, or extension.
**Usage examples:**
- Find all Python files in the current directory
- Find files matching a pattern in a specific directory
- Find files and execute a command on each result
- Find files by name quickly across entire filesystem
- Find files by name faster than find command
- Search and find files by name or extension

### yt-dlp
**Description:** Feature-rich command-line audio/video downloader. Download YouTube videos, playlists, and content from 1000+ sites including Vimeo, Twitter, and TikTok.
**Usage examples:**
- Download a video from YouTube
- Download audio only as MP3 from a YouTube video
- Download entire YouTube playlist with custom naming
- Download YouTube video to local file
- Download YouTube video in highest quality available
- Download any YouTube video or playlist

### git-lfs
**Description:** Git extension for versioning large files
**Usage examples:**
- Initialize Git LFS in a repository
- Track large files (e.g., video files) with Git LFS
- View which file patterns are tracked by Git LFS

### rsync
**Description:** Utility that provides fast incremental file transfer
**Usage examples:**
- Sync a local directory to a remote server
- Sync a remote directory to local machine with delete
- Sync between two local directories with progress

### htop
**Description:** Improved top (interactive process viewer)
**Usage examples:**
- Launch htop to view all running processes with real-time updates
- Monitor processes for a specific user
- Display processes in tree view to see parent-child relationships

### tree
**Description:** Display directories as trees (with optional color/HTML output)
**Usage examples:**
- Display directory structure of current folder
- Show tree with depth limit of 2 levels
- Display tree with colored output and ignore node_modules

### ncdu
**Description:** NCurses Disk Usage
**Usage examples:**
- Analyze disk usage of current directory interactively
- Analyze a specific directory and show largest subdirectories
- Export disk usage report to a file for later analysis

### bat
**Description:** Clone of cat(1) with syntax highlighting and Git integration
**Usage examples:**
- Display a file with syntax highlighting
- Show multiple files with line numbers and Git changes
- Pipe output from another command with syntax highlighting

### exa
**Description:** A modern replacement for ls
**Usage examples:**
- List files in the current directory with colors and icons
- List all files including hidden ones in long format with details
- List directory contents recursively with tree view

### httpie
**Description:** User-friendly cURL replacement (command-line HTTP client)
**Usage examples:**
- Make a simple GET request to a URL
- Send a POST request with JSON data
- Include custom headers and display response headers

### nmap
**Description:** Port scanning utility for large networks
**Usage examples:**
- Scan all ports on a target host
- Detect OS and service versions on target
- Scan a subnet for active hosts

### pandoc
**Description:** Swiss-army knife of markup format conversion
**Usage examples:**
- Convert Markdown file to HTML
- Convert Markdown to PDF via LaTeX
- Convert HTML to Markdown

### sox
**Description:** SOund eXchange: universal sound sample translator
**Usage examples:**
- Convert WAV file to MP3
- Record audio from microphone for 10 seconds
- Play an audio file

### ghostscript
**Description:** Interpreter for PostScript and PDF
**Usage examples:**
- Convert PDF to PNG images at 150 DPI
- Merge multiple PDF files into one
- Convert PostScript to PDF

## Test Query Results

| Query | Expected | #1 | #2 | #3 |
|-------|----------|----|----|----| 
| search text in files | ripgrep | zfind | gsar | fd |
| download file from url | curl | ipull | gdown | pget |
| resize image | imagemagick | imgdiet | imgp | caire |
| compress image | imagemagick | caesiumclt | jpeg-xl | libsquish |
| monitor system resources | htop | devcockpit | gtop | bpytop |
| list files in tree format | tree | tree-cli | tree-node-cli | lr |
| check disk usage | ncdu | duc | **ncdu** | baobab |
| view file with syntax highlighting | bat | cli-highlight | source-highlight | shiki |
| make http requests from terminal | httpie | ain | hurl | httping |
| convert document format | pandoc | unoconv | libmwaw | feishu2md |
| compress video without losing quality | ffmpeg | **ffmpeg** | libvmaf | kvazaar |
| pretty print json | jq | **jq** | prettyoutput | jsonpp |
| find files by name | fd | **fd** | fselect | find_duplicate_files |
| download youtube video | yt-dlp | **yt-dlp** | youtubedr | yewtube |
