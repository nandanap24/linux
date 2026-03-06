// ═══════════════════════════════════════════════════════════════════
// ALL TOPICS — MODULE 1 + MODULE 2
// ═══════════════════════════════════════════════════════════════════

const MODULE1 = [


// ─── PART 1: APPLICATIONS ────────────────────────────────────────
{
  id:'apps', num:'01',
  title:'Applications',
  subtitle:'Programs you interact with every day — and how they exist at the very top of the Linux software stack, relying entirely on lower layers to function.',
  sections:[
    {
      title:'What Is an Application?',
      body:`<p>An <strong>application</strong> is any software program that a user runs directly to accomplish a task — a web browser, text editor, music player, terminal emulator, file manager, or game. On Linux, applications sit at the <span class="kw">topmost layer</span> of the software stack. They are the furthest thing from hardware.</p>
<p>Every application on Linux is a <strong>process</strong> — a running instance of a program, assigned a unique <span class="kw">PID (Process ID)</span> by the kernel. A process has its own virtual memory space, open file descriptors, and CPU scheduling slot. When you quit an app, its process terminates and the kernel reclaims all resources.</p>
<div class="diagram">
  <div class="diagram-title">The Linux Stack — Where Applications Live</div>
  <div class="stack-item stack-active">👤 USER SPACE — Applications (Firefox, Terminal, GIMP, Python scripts…)</div>
  <div class="stack-arrow">↕ only via system calls</div>
  <div class="stack-item stack-dim">📚 Libraries — glibc, GTK, Qt (wrap syscalls in friendly functions)</div>
  <div class="stack-arrow">↕ library calls</div>
  <div class="stack-item stack-dim">⚙️ KERNEL SPACE — Linux Kernel (schedules, manages memory, drivers)</div>
  <div class="stack-arrow">↕ device drivers</div>
  <div class="stack-item stack-dim">🔩 HARDWARE — CPU, RAM, NVMe SSD, GPU, Network Card…</div>
</div>`
    },
    {
      title:'User Space vs Kernel Space',
      body:`<p>Linux divides all execution into two strict zones. This separation is one of the most important safety features in the OS:</p>
<ul>
<li><strong>User Space (Ring 3)</strong> — Where applications run. No direct hardware access. Memory is isolated per-process. A crash here only kills that one process.</li>
<li><strong>Kernel Space (Ring 0)</strong> — Where the OS kernel runs. Full, unrestricted hardware access. A crash here causes a <em>kernel panic</em> — the whole system halts.</li>
</ul>
<p>The CPU enforces this separation in hardware through <span class="kw">protection rings</span>. When code is running in Ring 3 and tries to access hardware directly, the CPU raises a <strong>General Protection Fault</strong> and kills the offending process. This is why a buggy app cannot corrupt your kernel or steal another app's password from memory.</p>`,
      chips:[
        {label:'Ring 0 — Kernel',val:'Full hardware control. Direct memory access. One crash = system crash (kernel panic).'},
        {label:'Ring 3 — User',val:'Restricted. No hardware access. Isolated memory. Crash = only that process dies.'},
        {label:'Privilege separation',val:'CPU hardware enforces the rings — software cannot bypass this.'},
        {label:'Process isolation',val:'Each process gets its own virtual address space — processes cannot read each other\'s RAM.'}
      ]
    },
    {
      title:'System Calls — The Only Bridge',
      body:`<p>If applications cannot touch hardware, how do they do anything? The answer is <span class="kw">system calls (syscalls)</span> — a precisely defined set of kernel functions that user-space programs can invoke to request services.</p>
<p>Linux has about 340 syscalls. Every meaningful action an app takes is ultimately a syscall. Here are the most common ones:</p>`,
      chips:[
        {label:'open() / openat()',val:'Open a file or directory and get a file descriptor (integer handle) back.'},
        {label:'read() / write()',val:'Read bytes from or write bytes to a file descriptor (file, socket, pipe, device).'},
        {label:'fork()',val:'Create a new child process as a copy of the current one. Returns child PID to parent.'},
        {label:'exec()',val:'Replace the current process image with a new program binary (loads new app into process).'},
        {label:'mmap()',val:'Map a file or anonymous memory region into the process\'s virtual address space.'},
        {label:'socket() / connect()',val:'Create and connect network sockets for sending/receiving data over TCP/UDP.'},
        {label:'exit()',val:'Terminate the current process and return an exit code to the parent.'},
        {label:'kill()',val:'Send a signal to another process (e.g., SIGTERM to ask it to quit gracefully).'}
      ]
    },
    {
      title:'Types of Linux Applications',
      body:`<p>Applications come in several forms, each with different characteristics — but they all make the same kernel syscalls underneath:</p>
<ul>
<li><strong>Native ELF Binaries</strong> — Compiled C/C++ programs. <span class="kw">ELF (Executable and Linkable Format)</span> is Linux's native binary format. When you run <code>ls</code>, <code>grep</code>, or Firefox, you're running an ELF binary. Use <code>file /usr/bin/ls</code> to see this.</li>
<li><strong>Interpreted Scripts</strong> — Python, Ruby, Bash, Perl. The interpreter itself is an ELF binary that reads and executes the script. A Python program still reaches the kernel via the Python interpreter's syscalls.</li>
<li><strong>GUI Applications</strong> — Use GTK (GNOME apps) or Qt (KDE apps) toolkits to draw widgets. These toolkits talk to the display server (Wayland or X11) to render to screen.</li>
<li><strong>CLI Applications</strong> — Read from <code>stdin</code>, write to <code>stdout</code>/<code>stderr</code>. Everything flows through file descriptors — the terminal is just a special file.</li>
<li><strong>Daemons / Services</strong> — Background processes with no UI: web servers (nginx), SSH server (sshd), database (postgresql). Managed by <code>systemd</code>.</li>
<li><strong>Containerized Apps</strong> — Standard Linux processes but wrapped in namespace isolation (Docker, Podman). They still make regular syscalls — containers are not VMs.</li>
</ul>`,
      code:`<span class="cc"># See the ELF binary type of any application</span>
file /usr/bin/bash
<span class="cs">ELF 64-bit LSB pie executable, x86-64</span>

<span class="cc"># See which shared libraries an app depends on</span>
ldd /usr/bin/ls
<span class="cc"># Output shows: linux-vdso.so, libselinux.so, libc.so…</span>

<span class="cc"># Watch every syscall an application makes</span>
strace <span class="cn">-c</span> ls /home
<span class="cc"># -c gives a summary count of each syscall used</span>

<span class="cc"># See all running application processes</span>
ps aux --sort=-%cpu | head -15`
    },
    {
      title:'How Copying Text Between Apps Actually Works',
      body:`<p>Understanding this flow ties everything together. When you copy text from Terminal and paste it into a browser, here is the complete journey through the Linux stack:</p>
<ol>
<li><strong>You select text</strong> → Terminal app calls <span class="kw-blue">read()</span> on the mouse/keyboard input event file in <code>/dev/input/</code></li>
<li><strong>Ctrl+C pressed</strong> → Terminal sends a <em>clipboard offer</em> to the Wayland compositor via the <code>wl_data_device</code> protocol over a Unix socket</li>
<li><strong>Compositor stores the offer</strong> — It does NOT copy the data yet. It just records "Terminal has clipboard data of type text/plain"</li>
<li><strong>You switch to browser</strong> → Input events route to browser; browser receives focus via compositor</li>
<li><strong>Ctrl+V in browser</strong> → Browser requests the clipboard data from compositor</li>
<li><strong>Compositor connects apps</strong> → Creates a <span class="kw">pipe</span> (kernel object): Terminal writes → browser reads. Both sides use <span class="kw-blue">write()</span> and <span class="kw-blue">read()</span> syscalls</li>
<li><strong>Text appears</strong> → Browser receives bytes, renders text in its text field → writes to its Wayland surface buffer → compositor composites it → GPU displays it</li>
</ol>
<p>Every single step involves syscalls. The text <strong>never leaves user space memory</strong> uncontrolled — the kernel mediates every transfer through pipes and sockets.</p>`
    }
  ],
  quiz:[
    {q:'What is a "process" in Linux?',opts:['A file stored in /proc/','A running instance of a program with its own PID, memory, and resources','A kernel thread only','A type of file permission'],ans:1,hint:'Think of the verb "process" — it\'s an active running thing, not a static file. The kernel assigns each one a number.'},
    {q:'Why can a crashed application on Linux never crash the whole operating system?',opts:['Linux has a virus scanner that catches crashes','Applications run in Ring 3 (User Space) — isolated from the kernel which runs in Ring 0','All apps are sandboxed in containers by default','The kernel makes automatic backups'],ans:1,hint:'The answer is about CPU privilege rings — applications and the kernel run in different hardware-enforced zones.'},
    {q:'What mechanism do applications use to request hardware services from the kernel?',opts:['Direct hardware calls','Shared libraries only','System Calls (syscalls)','IPC messages to init'],ans:2,hint:'There is a specific and well-defined "call" mechanism that crosses the user/kernel boundary — it triggers a CPU mode switch.'},
    {q:'What does ELF stand for in Linux binary format?',opts:['Executable Linux File','Extended Loader Format','Executable and Linkable Format','Embedded Linux Framework'],ans:2,hint:'Think about two properties of the binary format: you can both run it AND link it with other code at build time.'},
    {q:'When you copy text from Terminal and paste into Firefox in a Wayland session, which kernel object carries the data between them?',opts:['A shared file in /tmp/','A pipe — a kernel-managed unidirectional data channel','Direct shared memory mapped by the compositor','A Unix domain socket connection to the kernel']  ,ans:1,hint:'The compositor sets up a data transfer channel between the two apps — Linux has a specific unidirectional inter-process data conduit for this.'}
  ]
},

// ─── PART 2: DESKTOP ENVIRONMENT ─────────────────────────────────
{
  id:'desktop', num:'02',
  title:'Desktop Environment',
  subtitle:'The integrated graphical layer — window managers, panels, file managers, and toolkits — that assembles a complete working desktop on top of the window system.',
  sections:[
    {
      title:'What Is a Desktop Environment?',
      body:`<p>A <span class="kw">Desktop Environment (DE)</span> is a bundle of tightly integrated software that provides a complete graphical working environment. Without a DE, Linux presents only a text console. The DE includes everything you see and interact with daily: the taskbar, app launcher, notification area, file manager, settings panel, and default applications.</p>
<p>Crucially, a DE is <strong>completely replaceable</strong>. Unlike Windows or macOS where the desktop is inseparable from the OS, on Linux you can uninstall GNOME and install KDE Plasma without touching the kernel, filesystem, or any core services. This is possible because the DE sits cleanly above all lower layers.</p>
<div class="diagram">
  <div class="diagram-title">Desktop Environment in the Full Stack</div>
  <div class="stack-item stack-active">🖥️ Desktop Environment — Shell, Panel, File Manager, Settings, DE Apps</div>
  <div class="stack-arrow">↓ toolkit renders via</div>
  <div class="stack-item stack-dim">🪟 Window System — Wayland Compositor (or X11 Server)</div>
  <div class="stack-arrow">↓ compositor talks to</div>
  <div class="stack-item stack-dim">⚙️ Kernel — DRM/KMS graphics subsystem, input drivers</div>
  <div class="stack-arrow">↓</div>
  <div class="stack-item stack-dim">🔩 GPU + Display Hardware</div>
</div>`
    },
    {
      title:'GNOME — Architecture Deep Dive',
      body:`<p><span class="kw">GNOME</span> is the most widely deployed Linux DE (default on Ubuntu, Fedora, Debian, RHEL). Its architecture is built around a clean separation of shell, toolkit, and applications:</p>
<ul>
<li><strong>GNOME Shell</strong> — The top bar, Activities overview, notification center, and app launcher. Written in <em>JavaScript</em> using GJS (GNOME JavaScript). It runs as part of Mutter.</li>
<li><strong>Mutter</strong> — GNOME's combined window manager and Wayland compositor. Written in C. Responsible for compositing all windows into the final display frame.</li>
<li><strong>GTK (GIMP Toolkit)</strong> — The widget toolkit used by all GNOME apps. GTK4 uses GPU-accelerated rendering (OpenGL/Vulkan via GSK). When you see a button or text field in a GNOME app, it's drawn by GTK4.</li>
<li><strong>GLib / GIO</strong> — Core utility library: event loops, signals, file I/O abstraction, settings.</li>
<li><strong>dconf / GSettings</strong> — GNOME's configuration database (analogous to Windows Registry for GNOME settings). Stored in binary format at <code>~/.config/dconf/user</code>.</li>
<li><strong>D-Bus</strong> — Inter-process communication bus that connects GNOME components. Apps communicate with the Shell or system services via D-Bus messages.</li>
</ul>`,
      code:`<span class="cc"># Check GNOME Shell version</span>
gnome-shell --version

<span class="cc"># Read a GNOME setting</span>
gsettings get org.gnome.desktop.interface color-scheme
<span class="cc"># Output: 'prefer-dark' or 'default'</span>

<span class="cc"># Write a GNOME setting</span>
gsettings set org.gnome.desktop.interface text-scaling-factor <span class="cn">1.25</span>

<span class="cc"># Restart GNOME Shell without logging out (X11 only)</span>
Alt+F2 → type: r → Enter

<span class="cc"># List all GNOME extensions</span>
gnome-extensions list --enabled`
    },
    {
      title:'KDE Plasma — Architecture Deep Dive',
      body:`<p><span class="kw">KDE Plasma</span> is GNOME's primary competitor — famous for deep configurability and using the <span class="kw">Qt framework</span> instead of GTK. Plasma 6 is written in C++ with QML (Qt Markup Language) for UI definitions.</p>
<ul>
<li><strong>Plasma Shell</strong> — The desktop, panels, widgets (Plasmoids), and taskbar. Written in QML + C++.</li>
<li><strong>KWin</strong> — KDE's window manager and Wayland compositor. Supports desktop effects (compositing), virtual desktops, and tiling. Scriptable via JavaScript.</li>
<li><strong>Qt 6 Framework</strong> — The toolkit for all KDE apps. Qt handles rendering, input, networking, and cross-platform support. Apps: Dolphin (files), Konsole (terminal), Kate (editor), Gwenview (images).</li>
<li><strong>KConfig / KConfigXT</strong> — KDE's configuration system. Settings stored in plain-text INI files in <code>~/.config/</code> — human-readable, unlike dconf.</li>
<li><strong>Baloo</strong> — KDE's file indexer and metadata search engine (like GNOME Tracker).</li>
</ul>`,
      chips:[
        {label:'GNOME Toolkit',val:'GTK4 — C-based, GPU-accelerated via GSK. GNOME-native apps (Files, Gedit, Videos).'},
        {label:'KDE Toolkit',val:'Qt6 — C++/QML. Cross-platform (Linux, Windows, macOS). KDE apps (Dolphin, Kate).'},
        {label:'GNOME Config',val:'dconf binary database. Edited via gsettings CLI or GNOME Settings GUI.'},
        {label:'KDE Config',val:'Plain INI files in ~/.config/. Directly editable with a text editor.'},
        {label:'GNOME WM',val:'Mutter — compositing WM, also the Wayland compositor. Non-replaceable in GNOME.'},
        {label:'KDE WM',val:'KWin — compositing WM + Wayland compositor. Highly scriptable and configurable.'}
      ]
    },
    {
      title:'Other Desktop Environments',
      body:`<p>Linux offers many DEs beyond GNOME and KDE, each with distinct design philosophies:</p>`,
      chips:[
        {label:'XFCE',val:'Lightweight, fast, traditional layout. Uses GTK3. Ideal for older hardware or minimal installs. ~300MB RAM idle.'},
        {label:'LXQt',val:'Ultra-lightweight Qt-based DE. ~200MB RAM idle. Designed for very low-resource systems.'},
        {label:'Cinnamon',val:'Fork of GNOME 3 with a traditional taskbar layout. Default on Linux Mint. Familiar to Windows users.'},
        {label:'MATE',val:'Fork of GNOME 2. Classic, stable. Maintained for users who preferred the older GNOME interface.'},
        {label:'Budgie',val:'Modern DE built on GTK4. Default on Solus. Clean, panel-based, beginner-friendly.'},
        {label:'Hyprland',val:'Modern tiling Wayland compositor. Not a full DE — no bundled apps. Power-user oriented.'}
      ]
    },
    {
      title:'How the Desktop Environment Starts Up',
      body:`<p>Understanding DE startup connects all the layers together. Here is the complete boot-to-desktop journey:</p>
<ol>
<li><strong>UEFI/BIOS</strong> → Hardware POST, hands off to GRUB bootloader</li>
<li><strong>GRUB</strong> → Loads Linux kernel into RAM, passes boot parameters</li>
<li><strong>Kernel</strong> → Initializes hardware, mounts root filesystem, starts <code>systemd</code> as PID 1</li>
<li><strong>systemd</strong> → Starts system services in parallel (networking, udev, logind…) reaching <code>graphical.target</code></li>
<li><strong>Display Manager (GDM/SDDM)</strong> → systemd starts the DM service; DM shows the graphical login screen</li>
<li><strong>User logs in</strong> → DM authenticates via PAM, reads the selected session's <code>.desktop</code> file</li>
<li><strong>Session starts</strong> → For GNOME: <code>gnome-session</code> launches Mutter (compositor) + GNOME Shell. For KDE: <code>startplasma-wayland</code> launches KWin + Plasma Shell</li>
<li><strong>DE is running</strong> → Shell draws the desktop, panel appears, systray icons load, autostart apps launch</li>
</ol>
<p>The entire sequence from power-on to usable desktop typically takes 5–20 seconds on modern hardware.</p>`
    }
  ],
  quiz:[
    {q:'Which toolkit does GNOME use to render its graphical interface?',opts:['Qt6','wxWidgets','GTK (GIMP Toolkit)','SDL2'],ans:2,hint:'GNOME uses a different toolkit from KDE — it\'s from the GNU project family. GTK stands for "GIMP Toolkit" because it was first made for GIMP.'},
    {q:'What is Mutter in the context of GNOME?',opts:['A file manager for GNOME','A text editor plugin','GNOME\'s combined window manager and Wayland compositor','A configuration database tool'],ans:2,hint:'Mutter does two jobs: it positions windows AND composites them into the final frame sent to the GPU. KDE\'s equivalent is KWin.'},
    {q:'Where does KDE Plasma store its configuration files?',opts:['In a binary database like dconf','In plain INI-format text files in ~/.config/','In the kernel\'s /proc filesystem','In an SQL database in ~/.local/share/'],ans:1,hint:'Unlike GNOME\'s binary dconf database, KDE keeps its settings in a human-readable format you can open with any text editor.'},
    {q:'In the Linux boot sequence, what starts the Desktop Environment?',opts:['The kernel directly','GRUB bootloader','The Display Manager (GDM/SDDM), started by systemd','The user must run startx manually'],ans:2,hint:'There\'s a specific service that shows the login screen and then hands off to the DE after authentication — it\'s managed by systemd.'},
    {q:'Why can you switch Desktop Environments on Linux without reinstalling the OS?',opts:['DEs share the same configuration files','The DE sits on top of the kernel and window system as a separate, replaceable layer','Linux uses containers for each DE','All DEs are part of the same software package'],ans:1,hint:'Linux\'s layered architecture means each level is independent. The DE doesn\'t touch the kernel or filesystem — it just sits on top of them.'}
  ]
},

// ─── PART 3: WINDOW SYSTEM ───────────────────────────────────────
{
  id:'window', num:'03',
  title:'Window System',
  subtitle:'Wayland and X11 — the display protocol layer that draws windows on screen, routes input events, and manages multi-monitor setups.',
  sections:[
    {
      title:'What Is a Window System?',
      body:`<p>A <span class="kw">Window System</span> (also called a display server or display protocol) is the foundational layer between applications and the GPU. It is responsible for four core tasks:</p>
<ol>
<li><strong>Rendering coordination</strong> — Deciding what gets drawn on screen and when</li>
<li><strong>Input routing</strong> — Delivering keyboard, mouse, and touch events to the correct window</li>
<li><strong>Window management delegation</strong> — Working with the window manager to position, resize, and stack windows</li>
<li><strong>Multi-monitor management</strong> — Controlling display resolution, refresh rate, and output layout</li>
</ol>
<p>Without a window system, Linux can only display text. The window system is what enables graphical output.</p>
<div class="diagram">
  <div class="diagram-title">Window System Position in the Stack</div>
  <div class="stack-item stack-dim">🖥️ Applications (Firefox, Terminal, Files…)</div>
  <div class="stack-arrow">↓ draw commands via protocol (Wayland/X11)</div>
  <div class="stack-item stack-active">🪟 Window System — Wayland Compositor or X11 Server</div>
  <div class="stack-arrow">↓ via DRM/KMS API</div>
  <div class="stack-item stack-dim">⚙️ Kernel — DRM/KMS graphics subsystem</div>
  <div class="stack-arrow">↓</div>
  <div class="stack-item stack-dim">🎮 GPU Hardware + Display Controller</div>
</div>`
    },
    {
      title:'X11 — The Legacy System (1987–Present)',
      body:`<p><span class="kw">X11</span> (X Window System, Version 11) was designed at MIT in 1987 and became the standard display system for Unix/Linux for over 35 years. Understanding it explains why Linux moved to Wayland.</p>
<p><strong>X11 Client–Server Architecture:</strong></p>
<ul>
<li>The <span class="kw">X Server</span> owns the display, keyboard, and mouse. It manages hardware output.</li>
<li><span class="kw">X Clients</span> (applications) connect to the server and send drawing commands over the X Protocol.</li>
<li>A <span class="kw">Window Manager</span> is just another X client — a special one that intercepts window placement requests.</li>
</ul>
<p><strong>X11's famous superpower — Network Transparency:</strong> Because X11 uses a protocol over a socket, you can run an application on a remote server and display its window on your local screen: <code>ssh -X user@server gedit</code>. The app runs remotely; only pixel drawing commands travel over the network.</p>
<p><strong>X11's fundamental problem:</strong> Every X client can see every other client's input events and screen content. There is no isolation. A malicious app could keylog your password manager. This was acceptable in 1987 but unacceptable today.</p>`,
      chips:[
        {label:'Born',val:'1987, MIT Lab for Computer Science. Version 11 released Sept 1987, still in use.'},
        {label:'Implementation',val:'Xorg — the dominant open source X server. Config: /etc/X11/xorg.conf'},
        {label:'Architecture',val:'Client-server: X clients send drawing commands to the X server over sockets.'},
        {label:'Network transparency',val:'Run GUI apps on remote machines, display locally over SSH -X or DISPLAY var.'},
        {label:'Window Manager in X11',val:'Just another X client. Can be swapped: i3, Openbox, GNOME\'s Mutter in X mode.'},
        {label:'Security flaw',val:'Apps can spy on each other\'s input events. No isolation between X clients.'}
      ]
    },
    {
      title:'Wayland — The Modern Replacement',
      body:`<p><span class="kw">Wayland</span> is a display protocol designed to fix X11's fundamental architectural problems. It was started in 2008 and is now the default on GNOME (since 2021) and KDE Plasma (since 2023).</p>
<p><strong>Key architectural difference:</strong> In Wayland, there is no separate display server. The <span class="kw">compositor</span> IS the display server. GNOME's Mutter and KDE's KWin act as both the window manager AND the Wayland compositor.</p>
<p><strong>How Wayland rendering works:</strong></p>
<ol>
<li>Each app renders its own window content into a <span class="kw">buffer</span> (allocated via <code>wl_buffer</code>)</li>
<li>The app signals the compositor: "my buffer is ready"</li>
<li>The compositor reads all app buffers, composites them into the final frame</li>
<li>Compositor sends the final frame to the kernel's <span class="kw">DRM/KMS</span> subsystem</li>
<li>The GPU scans out the frame to the display</li>
</ol>
<p><strong>Security improvement:</strong> Each app only receives input events for its own window. A background app cannot see what you type in another app's window — solving X11's keylogging problem.</p>`,
      code:`<span class="cc"># Check if you are running Wayland or X11</span>
echo $WAYLAND_DISPLAY    <span class="cc"># Set if Wayland (e.g., wayland-0)</span>
echo $DISPLAY            <span class="cc"># Set if X11 (e.g., :0)</span>

<span class="cc"># Detailed session type info</span>
loginctl show-session $(loginctl | grep $(whoami) | awk '{print $1}') -p Type

<span class="cc"># Force an app to use XWayland (X11 compatibility layer)</span>
GDK_BACKEND=x11 app-name

<span class="cc"># Check which compositor is running</span>
ps aux | grep -E 'mutter|kwin|sway|hyprland'`
    },
    {
      title:'Wayland vs X11 — Side by Side',
      body:`<p>Here is a direct comparison of the two systems on key dimensions:</p>`,
      chips:[
        {label:'X11 — Security',val:'No isolation: any app can read input from any other app\'s window. Clipboard is shared globally.'},
        {label:'Wayland — Security',val:'Full isolation: apps only receive events for their own windows. Clipboard is mediated by compositor.'},
        {label:'X11 — Architecture',val:'Separate X server process. Window manager is a client. Three processes: app + X server + WM.'},
        {label:'Wayland — Architecture',val:'Compositor IS the display server AND window manager. One integrated process (e.g., Mutter).'},
        {label:'X11 — Screen recording',val:'Any app can grab the screen via XShmGetImage(). No permission needed.'},
        {label:'Wayland — Screen recording',val:'Requires compositor portal (xdg-desktop-portal). User must grant permission.'},
        {label:'X11 — Network',val:'Network transparent: run remote GUI apps via SSH -X. Works out of the box.'},
        {label:'Wayland — Network',val:'Not network transparent by design. Use Waypipe or RDP for remote GUI access.'}
      ]
    },
    {
      title:'XWayland — Backwards Compatibility Bridge',
      body:`<p>Many apps still use the X11 API. Wayland provides <span class="kw">XWayland</span> — an X11 server that runs as a Wayland client — to support them. When you run an old X11 app on a Wayland session:</p>
<ol>
<li>XWayland starts automatically (if not already running)</li>
<li>The X11 app connects to XWayland as if it were a normal X server</li>
<li>XWayland renders the app's output to a Wayland buffer</li>
<li>The Wayland compositor composites XWayland's buffer alongside native Wayland windows</li>
</ol>
<p>From the user's perspective, X11 apps look identical to native Wayland apps. The performance overhead of XWayland is minimal. Over time, as apps migrate to native Wayland (via GTK4, Qt6, or SDL2 with Wayland backends), XWayland becomes less necessary.</p>`,
      code:`<span class="cc"># See if XWayland is running (it starts on demand)</span>
ps aux | grep Xwayland

<span class="cc"># Identify which apps are using XWayland vs native Wayland</span>
<span class="cc"># Install xorg-xprop, then click any window:</span>
xprop | grep -i wayland
<span class="cc"># No output = native Wayland app</span>
<span class="cc"># Has WM_CLASS etc = X11 app via XWayland</span>

<span class="cc"># Force an app to try native Wayland instead of XWayland</span>
MOZ_ENABLE_WAYLAND=1 firefox   <span class="cc"># Firefox native Wayland</span>
QT_QPA_PLATFORM=wayland app   <span class="cc"># Qt app native Wayland</span>`
    }
  ],
  quiz:[
    {q:'In Wayland\'s architecture, who acts as the "display server"?',opts:['A separate Wayland daemon process','The kernel\'s DRM subsystem','The compositor (e.g., Mutter or KWin) — which is also the window manager','A dedicated wl-server binary'],ans:2,hint:'Wayland\'s key architectural innovation is merging the display server and window manager into one. In GNOME, it\'s Mutter. In KDE, it\'s KWin.'},
    {q:'What is the main security flaw in X11 that Wayland was designed to fix?',opts:['X11 cannot display multiple windows at once','X11 apps can read input events from other apps\' windows — enabling keylogging','X11 does not support network connections','X11 runs as root by default'],ans:1,hint:'In X11, there is no isolation between clients. Any app could register as a global key listener and record everything you type anywhere.'},
    {q:'What is XWayland?',opts:['A new version of the X Window System','An X11 server that runs as a Wayland client, providing backwards compatibility','A Wayland compositor for older hardware','A GTK3 compatibility layer'],ans:1,hint:'It lets old X11 apps run on a Wayland desktop without modification — it\'s a bridge that "translates" X11 into Wayland.'},
    {q:'How do you check if your current Linux session is running Wayland?',opts:['Check if /etc/wayland exists','Run \'wayland-check\' command','Check if $WAYLAND_DISPLAY environment variable is set','Check if Xorg process is running'],ans:2,hint:'Wayland sessions set a specific environment variable. If it\'s set, you\'re on Wayland. If $DISPLAY is set but not this, you\'re on X11.'},
    {q:'What command lets you watch every X11 system call an application makes to debug display issues?',opts:['strace -e display','xprop','DISPLAY=:0 app','xev'],ans:3,hint:'It\'s an X11 tool that creates a small window and prints every event (keyboard, mouse, focus) it receives — very useful for debugging input issues.'}
  ]
},

// ─── PART 4: DISPLAY MANAGER ─────────────────────────────────────
{
  id:'display-mgr', num:'04',
  title:'Display Manager',
  subtitle:'The graphical gatekeeper — started by systemd at boot to show the login screen, authenticate users via PAM, and launch the chosen Desktop Environment session.',
  sections:[
    {
      title:'What Is a Display Manager?',
      body:`<p>The <span class="kw">Display Manager (DM)</span>, also called a <em>login manager</em>, is the service that provides the graphical login screen after boot. It is started by <code>systemd</code> as part of the <code>graphical.target</code> and handles three jobs:</p>
<ol>
<li><strong>Present the login screen</strong> — Render a graphical "greeter" showing username/password fields, a session selector, and system info</li>
<li><strong>Authenticate the user</strong> — Pass credentials to the <span class="kw">PAM (Pluggable Authentication Modules)</span> framework for verification</li>
<li><strong>Launch the chosen session</strong> — Start the selected Desktop Environment as the authenticated user</li>
</ol>
<div class="diagram">
  <div class="diagram-title">Boot Sequence to Desktop</div>
  <div class="stack-item stack-dim">🔌 Power on → UEFI/BIOS POST → GRUB bootloader</div>
  <div class="stack-arrow">↓</div>
  <div class="stack-item stack-dim">🐧 Linux Kernel loads → hardware initialized</div>
  <div class="stack-arrow">↓</div>
  <div class="stack-item stack-dim">⚙️ systemd (PID 1) → parallel service startup</div>
  <div class="stack-arrow">↓</div>
  <div class="stack-item stack-active">🔑 Display Manager starts → graphical login screen appears</div>
  <div class="stack-arrow">↓ user authenticates</div>
  <div class="stack-item stack-dim">🖥️ Desktop Environment launches → usable desktop</div>
</div>`
    },
    {
      title:'Major Display Managers',
      body:`<p>Different Desktop Environments ship with their preferred display manager, but any DM can launch any DE:</p>`,
      chips:[
        {label:'GDM3 (GNOME)',val:'GNOME Display Manager. Default on Ubuntu, Fedora, Debian, RHEL. Uses GNOME Shell as the greeter. Supports Wayland sessions natively.'},
        {label:'SDDM (KDE)',val:'Simple Desktop Display Manager. Default on KDE Plasma, openSUSE, Manjaro KDE. QML-based, fully themeable. Supports Wayland and X11 sessions.'},
        {label:'LightDM',val:'Cross-DE lightweight display manager. Supports multiple "greeter" frontends. Default on XFCE (Xubuntu), Linux Mint XFCE. Very configurable.'},
        {label:'XDM',val:'The original X Display Manager from 1988. Minimal, text-file configured. Rarely used in modern systems.'},
        {label:'LXDM',val:'LXDE\'s display manager. Lightweight, used with the LXDE/LXQt desktop environments.'},
        {label:'Ly',val:'Terminal-based TUI display manager. No graphical greeter — just a clean text interface. Minimal and fast.'}
      ]
    },
    {
      title:'PAM — How Authentication Actually Works',
      body:`<p>Display managers do <strong>not</strong> implement their own password checking. They delegate to <span class="kw">PAM (Pluggable Authentication Modules)</span> — a flexible framework that separates the <em>"what needs to authenticate"</em> from the <em>"how to authenticate"</em>.</p>
<p><strong>The GDM authentication flow in detail:</strong></p>
<ol>
<li>User types username + password into GDM's greeter</li>
<li>GDM calls <code>pam_start()</code> with the service name <code>"gdm-password"</code></li>
<li>PAM reads <code>/etc/pam.d/gdm-password</code> — the module stack configuration</li>
<li>PAM runs <code>pam_unix.so</code> → hashes the typed password with the stored salt</li>
<li>Compares against the hash in <code>/etc/shadow</code> (root-readable only)</li>
<li>If matched → PAM runs session modules: <code>pam_systemd.so</code> creates a login session, <code>pam_env.so</code> sets environment variables</li>
<li>GDM receives <code>PAM_SUCCESS</code> → launches the chosen desktop session as that user</li>
</ol>
<p>PAM's "pluggable" design means you can add fingerprint auth, TOTP 2-factor, LDAP, or smart card authentication by adding PAM modules — without changing GDM, SDDM, or any other DM code.</p>`,
      code:`<span class="cc"># Check which display manager is running</span>
cat /etc/X11/default-display-manager
<span class="cc"># or</span>
systemctl status display-manager

<span class="cc"># Enable GDM3 to start on boot</span>
sudo systemctl enable gdm3

<span class="cc"># Switch default DM to SDDM</span>
sudo systemctl disable gdm3
sudo systemctl enable sddm

<span class="cc"># Switch systemd to boot with GUI (graphical target)</span>
sudo systemctl set-default graphical.target

<span class="cc"># Switch to text-only boot (no DM, no GUI)</span>
sudo systemctl set-default multi-user.target`
    },
    {
      title:'Session Files — How the DM Knows Which DEs Are Available',
      body:`<p>The session selector dropdown in the login screen is populated from <span class="kw">.desktop session files</span>. These are plain text files that tell the DM how to start each available DE:</p>
<ul>
<li><code>/usr/share/xsessions/</code> — X11 sessions (e.g., <code>gnome.desktop</code>, <code>plasma.desktop</code>, <code>i3.desktop</code>)</li>
<li><code>/usr/share/wayland-sessions/</code> — Wayland sessions (e.g., <code>gnome-wayland.desktop</code>, <code>plasmawayland.desktop</code>)</li>
</ul>
<p>Each <code>.desktop</code> file looks like this:</p>`,
      code:`<span class="cc"># /usr/share/wayland-sessions/gnome-wayland.desktop</span>
[<span class="cf">Desktop Entry</span>]
<span class="cn">Name</span>=GNOME
<span class="cn">Comment</span>=This session logs you into GNOME (Wayland)
<span class="cn">Exec</span>=gnome-session
<span class="cn">Type</span>=Application
<span class="cn">DesktopNames</span>=GNOME

<span class="cc"># /usr/share/wayland-sessions/plasmawayland.desktop</span>
[<span class="cf">Desktop Entry</span>]
<span class="cn">Name</span>=Plasma (Wayland)
<span class="cn">Comment</span>=KDE Plasma Desktop
<span class="cn">Exec</span>=startplasma-wayland
<span class="cn">Type</span>=Application

<span class="cc"># List all available sessions on your system</span>
ls /usr/share/xsessions/
ls /usr/share/wayland-sessions/`
    },
    {
      title:'What Happens After Login — Session Initialization',
      body:`<p>Once PAM authenticates the user and the DM reads the session file, here is what happens in the seconds between clicking "Log In" and seeing your desktop:</p>
<ol>
<li><strong>DM forks a child process</strong> as the authenticated user (drops root privileges)</li>
<li><strong>Session environment is set up</strong> — <code>HOME</code>, <code>USER</code>, <code>XDG_SESSION_TYPE</code> (wayland or x11), <code>DBUS_SESSION_BUS_ADDRESS</code></li>
<li><strong>D-Bus session bus starts</strong> — The IPC bus for this user's session. All DE components use this to communicate.</li>
<li><strong>Session command runs</strong> — e.g., <code>gnome-session</code> or <code>startplasma-wayland</code>. This starts the compositor (Mutter/KWin), which then starts the shell.</li>
<li><strong>Autostart apps launch</strong> — Apps in <code>~/.config/autostart/</code> and <code>/etc/xdg/autostart/</code> start after the desktop is ready</li>
<li><strong>Desktop is interactive</strong> — You see your wallpaper, panel, and desktop icons</li>
</ol>`,
      chips:[
        {label:'XDG_SESSION_TYPE',val:'Environment variable set to "wayland" or "x11". Apps check this to know which display protocol to use.'},
        {label:'D-Bus session bus',val:'Per-user IPC bus. Started at login. Used by apps to communicate with DE services.'},
        {label:'~/.config/autostart/',val:'Desktop files in this directory launch automatically after you log in.'},
        {label:'logind (systemd)',val:'Manages login sessions, seat assignment, and device access permissions per session.'}
      ]
    }
  ],
  quiz:[
    {q:'What is the primary job of a Display Manager?',opts:['Manage display hardware resolution','Provide graphical login, authenticate users via PAM, and launch the chosen DE session','Render the desktop wallpaper','Control screen brightness and orientation'],ans:1,hint:'Think of the "gate" between boot and your desktop — it shows the login screen and launches the session after authentication.'},
    {q:'Which Display Manager is the default for KDE Plasma?',opts:['GDM3','LightDM','XDM','SDDM'],ans:3,hint:'Its name stands for "Simple Desktop Display Manager" — designed to be a clean, QML-based DM for KDE.'},
    {q:'What authentication framework do Display Managers delegate to for verifying user passwords?',opts:['OAuth2','Shadow password file directly','PAM (Pluggable Authentication Modules)','D-Bus security policy'],ans:2,hint:'Linux uses a modular "pluggable" auth framework that can handle passwords, biometrics, and smart cards — DMs just call into it.'},
    {q:'Where does the Display Manager look to find out which Desktop Environments are available to list in the session selector?',opts:['/etc/sessions.conf','/usr/share/xsessions/ and /usr/share/wayland-sessions/','~/.config/dm/sessions/','The kernel module list'],ans:1,hint:'System-wide session definitions are stored in /usr/share — in a directory specifically named after the session protocol type.'},
    {q:'What systemd target must be active for a Display Manager to start on boot?',opts:['network.target','multi-user.target','graphical.target','rescue.target'],ans:2,hint:'The target that includes display managers and GUI — its name literally describes what it provides: a graphical interface.'}
  ]
},

// ─── PART 5: HOW IT ALL CONNECTS ─────────────────────────────────
{
  id:'ui-flow', num:'05',
  title:'The Complete UI Layer Flow',
  subtitle:'How applications, the desktop environment, the window system, and the display manager work together — tracing every user action from mouse click to pixel on screen.',
  sections:[
    {
      title:'The Complete UI Stack at a Glance',
      body:`<p>You now know each layer individually. This part shows how they <strong>connect in real-time</strong> every moment you use your computer. Every single user interaction flows through all four layers:</p>
<div class="diagram">
  <div class="diagram-title">Complete UI Layer — Unified View</div>
  <div class="stack-item stack-active">📱 APPS — Firefox, Terminal, GIMP (GTK4/Qt6 toolkits, ELF binaries, syscalls)</div>
  <div class="stack-arrow">↓ apps render into Wayland buffers / X11 draw commands</div>
  <div class="stack-item stack-active">🖥️ DE — Mutter / KWin composites all buffers into final frame</div>
  <div class="stack-arrow">↓ compositor sends frame via DRM/KMS API</div>
  <div class="stack-item stack-active">🪟 WINDOW SYSTEM — Wayland protocol / X11 protocol carries draw + input data</div>
  <div class="stack-arrow">↓ before any of this: DM authenticated you and launched the DE</div>
  <div class="stack-item stack-active">🔑 DISPLAY MGR — GDM / SDDM (authenticated at boot via PAM, started by systemd)</div>
  <div class="stack-arrow">↓</div>
  <div class="stack-item stack-dim">⚙️ Kernel + Hardware (always underneath everything)</div>
</div>
<p>The Display Manager ran <em>once</em> at login. The Window System and DE run <em>continuously</em> while you use the computer. Applications come and go on top.</p>`
    },
    {
      title:'Tracing: Opening a File Manager',
      body:`<p>You double-click the "Files" (Nautilus) icon on the GNOME desktop. Here is the complete journey:</p>
<ol>
<li><strong>Mouse click → input event</strong>: The mouse generates a USB HID interrupt. The kernel's <code>evdev</code> driver creates an event. <code>libinput</code> in userspace processes it. The Wayland compositor receives the pointer event via its input handling loop.</li>
<li><strong>Compositor identifies target</strong>: Mutter checks which surface is at the click coordinates. It's the GNOME Shell desktop surface with the Files icon.</li>
<li><strong>GNOME Shell handles click</strong>: The Shell's JS code detects the double-click on the Files icon. It calls <code>GLib.spawn_async()</code> which internally calls <span class="kw-blue">fork()</span> + <span class="kw-blue">exec()</span> syscalls.</li>
<li><strong>Nautilus starts as a process</strong>: Kernel creates a new process, allocates virtual memory, loads the ELF binary from disk. Nautilus initializes GTK4, connects to the Wayland compositor via the <code>wayland-0</code> socket.</li>
<li><strong>Window creation</strong>: Nautilus creates a <code>wl_surface</code> and requests a toplevel window from the compositor. Mutter assigns a position and size.</li>
<li><strong>First render</strong>: Nautilus reads the home directory via <span class="kw-blue">getdents64()</span> syscalls. GTK4 renders file icons into a GPU buffer using OpenGL/Vulkan. Nautilus submits the buffer to the compositor.</li>
<li><strong>Compositor composites</strong>: Mutter blends Nautilus's buffer with the desktop background and other windows into the final frame, sends to the GPU via DRM/KMS.</li>
<li><strong>Display output</strong>: GPU scans the framebuffer to your monitor at the configured refresh rate (e.g., 144Hz).</li>
</ol>`
    },
    {
      title:'Tracing: Moving a Window Across the Screen',
      body:`<p>You grab the Nautilus title bar and drag it to the right. What happens at every layer?</p>
<ol>
<li><strong>Mouse press on titlebar</strong>: Input event → compositor detects mousedown on the window's titlebar decoration</li>
<li><strong>Move request</strong>: Compositor itself handles the drag — the app doesn't need to know. Mutter enters "interactive move" mode for that window.</li>
<li><strong>Mouse moves right</strong>: Each mouse movement event updates Mutter's internal window position record. No data is copied. No syscall overhead from the app. The compositor just changes where it composites the existing window buffer.</li>
<li><strong>Frame rendered</strong>: Mutter renders a new frame: same app buffer, new position. Sends to GPU. Your monitor shows the window moved.</li>
<li><strong>Mouse release</strong>: Compositor finalizes the new position. Notifies the app of its new window coordinates via <code>xdg_toplevel.configure</code> event.</li>
<li><strong>App acknowledges</strong>: Nautilus responds to the configure event, potentially re-renders if size changed.</li>
</ol>
<p><strong>Key insight:</strong> Moving a window does NOT copy pixel data. The compositor just changes the transformation matrix. This is why window dragging is GPU-accelerated and smooth at 60/120/144fps — it's a matrix operation, not a memory copy.</p>`,
      chips:[
        {label:'No pixel copy on drag',val:'Compositor changes where the existing buffer is composited. Window buffer stays in GPU VRAM.'},
        {label:'DRM/KMS page flip',val:'Each new frame is a "page flip" — GPU atomically switches to the new composited framebuffer.'},
        {label:'VSync',val:'Frame submission is synchronized to display refresh rate to prevent tearing artifacts.'},
        {label:'GPU compositing',val:'All alpha blending, shadows, and window stacking happen on the GPU as shader operations.'}
      ]
    },
    {
      title:'Tracing: Logging In at Boot',
      body:`<p>You turn on your computer and log in. Here is every layer activating in sequence:</p>`,
      chips:[
        {label:'1. UEFI POST',val:'Firmware initializes hardware, runs Power-On Self Test, finds boot device, loads GRUB.'},
        {label:'2. GRUB bootloader',val:'Shows boot menu, loads vmlinuz (kernel image) and initrd into RAM, passes control to kernel.'},
        {label:'3. Kernel init',val:'Initializes CPU, memory, storage, networking. Mounts root filesystem. Spawns systemd as PID 1.'},
        {label:'4. systemd services',val:'Starts udev, networking, logging (journald), logind, and finally starts the DM service (gdm.service).'},
        {label:'5. Display Manager',val:'GDM starts Mutter in "greeter" mode to show the login screen. Wayland compositor is already running.'},
        {label:'6. Authentication',val:'You type password. GDM passes to PAM → pam_unix.so checks /etc/shadow → PAM_SUCCESS returned.'},
        {label:'7. Session launch',val:'GDM reads /usr/share/wayland-sessions/gnome-wayland.desktop. Runs gnome-session as your user.'},
        {label:'8. Desktop ready',val:'Mutter starts in full DE mode. GNOME Shell loads. D-Bus session bus starts. Autostart apps launch.'}
      ]
    },
    {
      title:'Why This Architecture Makes Linux Powerful',
      body:`<p>The modular stack design has concrete real-world benefits that distinguish Linux from other operating systems:</p>
<ul>
<li><strong>Composability</strong> — Mix and match: use KDE's KWin compositor with GNOME apps, or run i3 (a standalone WM) without any DE. No other OS allows this.</li>
<li><strong>Crashless desktop</strong> — If Firefox crashes, only Firefox dies. If GNOME Shell crashes, it can restart in ~2 seconds without logging you out — all other apps keep running because they talk to Mutter directly.</li>
<li><strong>Remote desktops without special tools</strong> — X11's network transparency lets you run graphical apps on servers. Wayland achieves similar functionality via Waypipe or RDP.</li>
<li><strong>Headless servers</strong> — Remove the entire UI layer (set <code>multi-user.target</code>). The kernel, systemd, and all services run identically. Same OS, zero UI overhead.</li>
<li><strong>Custom login flows</strong> — Kiosk systems (ATMs, info screens) replace GDM with a custom DM that auto-logs into a locked-down session.</li>
</ul>
<p>Every concept in this module has a direct counterpart in the modules ahead. The systemd that starts GDM (Module 2), the kernel that enforces Ring 3/Ring 0 separation (Module 4), the hardware drivers that feed input events upward (Module 5) — the UI layer rests on all of them.</p>`,
      code:`<span class="cc"># Practical commands to explore the UI stack</span>

<span class="cc"># See the complete process tree from systemd → DM → DE → apps</span>
systemctl status graphical.target
pstree -p $(pidof systemd) | grep -E 'gdm|gnome|mutter|Xwayland'

<span class="cc"># Monitor GPU frame compositing in real time</span>
sudo intel_gpu_top    <span class="cc"># Intel GPU</span>
sudo nvtop            <span class="cc"># NVIDIA/AMD GPU</span>

<span class="cc"># Watch Wayland protocol messages between app and compositor</span>
WAYLAND_DEBUG=1 gedit 2>&1 | head -50

<span class="cc"># See all active Wayland surfaces (windows)</span>
<span class="cc"># In GNOME: install gnome-shell-extension-looking-glass</span>
<span class="cc"># then: Alt+F2 → lg → Surfaces tab</span>

<span class="cc"># Check session type and display environment</span>
echo "Session type: $XDG_SESSION_TYPE"
echo "Wayland display: $WAYLAND_DISPLAY"
echo "X display: $DISPLAY"`
    }
  ],
  quiz:[
    {q:'When you drag a window across the screen in Wayland, what does the compositor do with the window\'s pixel buffer?',opts:['It copies the pixel data to the new screen position in RAM','It re-renders the entire window at the new position','It changes the compositing position transform — the buffer stays in GPU VRAM unchanged','It asks the application to redraw itself at the new coordinates'],ans:2,hint:'This is why dragging is smooth and GPU-accelerated. No pixel data is copied or redrawn — it\'s a simple matrix transform in the compositor.'},
    {q:'If GNOME Shell crashes, what happens to all your open applications like Firefox and Terminal?',opts:['They all crash too because they depend on the Shell','They are suspended and resume when Shell restarts','They keep running normally — they talk to Mutter (compositor) directly, not to the Shell','The entire desktop session must be restarted'],ans:2,hint:'GNOME Shell is just the UI chrome — the compositor (Mutter) keeps running. Apps communicate with Mutter directly, so they survive a Shell crash.'},
    {q:'In what order do these start during boot? (1=first, 4=last)',opts:['GRUB → Kernel → systemd → Display Manager','Display Manager → Kernel → systemd → GRUB','Kernel → GRUB → Display Manager → systemd','systemd → Kernel → GRUB → Display Manager'],ans:0,hint:'Think of it logically: you need the bootloader to load the kernel, the kernel to start the init system, and the init system to start the login manager.'},
    {q:'What enables an app like Firefox to still run on a Wayland desktop even though it originally used the X11 API?',opts:['Firefox was silently recompiled for Wayland','XWayland — an X11 server that runs as a Wayland client, translating X11 calls into Wayland','The Linux kernel auto-converts X11 calls to Wayland','GTK4 acts as a middleware translator'],ans:1,hint:'There\'s a compatibility bridge that "speaks X11" to old apps but internally forwards everything to the Wayland compositor. It starts automatically on demand.'},
    {q:'Which single command would switch your Linux system to boot without any GUI or Display Manager?',opts:['sudo systemctl stop gdm','sudo rm /usr/share/wayland-sessions/*.desktop','sudo systemctl set-default multi-user.target','sudo systemctl mask graphical.target'],ans:2,hint:'systemd targets define what services run at boot. There is a specific target for multi-user text mode — setting it as default removes the graphical boot.'}
  ]
}
];

const MODULE2 = [


// ─── PART 1: THE LINUX BOOT PROCESS ─────────────────────────────
{
  id:'boot', num:'01',
  title:'The Linux Boot Process',
  subtitle:'From the moment you press the power button to PID 1 — the complete, step-by-step sequence that brings a Linux system to life.',
  sections:[
    {
      title:'What Happens When You Power On?',
      body:`<p>Booting a Linux system is a precisely ordered sequence of events. Each stage hands off control to the next. Understanding this sequence is fundamental to diagnosing boot failures, configuring services, and understanding where <span class="kw">systemd</span> fits into the picture.</p>
<div class="diagram">
  <div class="diagram-title">Linux Boot Sequence — High Level</div>
  <div class="stack-item stack-dim">🔌 Power On / Reset</div>
  <div class="stack-arrow">↓</div>
  <div class="stack-item stack-dim">🔧 UEFI/BIOS Firmware — Hardware POST</div>
  <div class="stack-arrow">↓</div>
  <div class="stack-item stack-dim">📀 GRUB2 Bootloader — Kernel selection</div>
  <div class="stack-arrow">↓</div>
  <div class="stack-item stack-dim">🐧 Linux Kernel — Hardware init, mounts root fs</div>
  <div class="stack-arrow">↓</div>
  <div class="stack-item stack-active">⚙️ systemd (PID 1) — Service orchestration</div>
  <div class="stack-arrow">↓</div>
  <div class="stack-item stack-dim">🖥️ graphical.target or multi-user.target</div>
</div>
<p>Each layer is independent and replaceable. You can swap GRUB for another bootloader, or (on embedded systems) run a different init system instead of systemd — the kernel doesn't care which PID 1 it spawns.</p>`
    },
    {
      title:'Stage 1 — UEFI/BIOS Firmware',
      body:`<p>When power is applied, the CPU starts executing code from a fixed address in ROM — the <span class="kw">UEFI</span> (Unified Extensible Firmware Interface) or legacy <span class="kw">BIOS</span> firmware.</p>
<p><strong>BIOS (legacy):</strong> Runs the Power-On Self Test (POST) — verifies CPU, RAM, and basic hardware. Then scans boot devices for a <span class="kw">Master Boot Record (MBR)</span> — a 512-byte structure at the first sector of the disk. The MBR contains GRUB's first-stage bootloader code. BIOS hands execution to the MBR.</p>
<p><strong>UEFI (modern):</strong> Replaces BIOS with a full firmware environment. Reads a <span class="kw">GPT partition table</span> and finds the <span class="kw">EFI System Partition (ESP)</span> — a FAT32 partition containing <code>.efi</code> bootloader files. UEFI loads <code>/boot/efi/EFI/grub/grubx64.efi</code> directly — no 512-byte limitation, supports Secure Boot.</p>`,
      chips:[
        {label:'POST',val:'Power-On Self Test: CPU, RAM, GPU, storage checks. Fails if critical hardware is absent.'},
        {label:'BIOS + MBR',val:'Legacy. 512-byte MBR holds bootloader stage 1. Max disk size: 2TB. Max 4 primary partitions.'},
        {label:'UEFI + GPT',val:'Modern. ESP partition holds .efi file. Supports >2TB disks, 128 partitions, Secure Boot.'},
        {label:'Secure Boot',val:'UEFI feature: only signed bootloaders run. Prevents bootkits. Linux uses shim + MOK keys.'},
        {label:'EFI vars',val:'UEFI stores boot order and config in NVRAM. Read/write with efibootmgr command.'},
        {label:'Boot order',val:'UEFI checks devices in priority order. Change with efibootmgr -o or in UEFI setup menu.'}
      ]
    },
    {
      title:'Stage 2 — GRUB2 Bootloader',
      body:`<p><span class="kw">GRUB2</span> (Grand Unified Bootloader version 2) is the most common Linux bootloader. It handles one critical job: load the Linux kernel and initial RAM disk into memory, then transfer control to the kernel.</p>
<p><strong>GRUB2 loading sequence:</strong></p>
<ol>
<li><strong>Stage 1</strong> (MBR or EFI) — Tiny code that loads Stage 2 from the <code>/boot</code> partition</li>
<li><strong>Stage 2</strong> (core.img) — Full GRUB environment: reads <code>/boot/grub/grub.cfg</code>, shows menu, handles input</li>
<li><strong>Kernel loading</strong> — GRUB loads <code>vmlinuz</code> (compressed kernel) and <code>initrd.img</code> (initial RAM disk) into RAM</li>
<li><strong>Kernel handoff</strong> — GRUB calls the kernel entry point, passing <span class="kw">kernel parameters</span> (cmdline args)</li>
</ol>
<p><strong>Important GRUB files:</strong></p>
<ul>
<li><code>/boot/grub/grub.cfg</code> — Main config (auto-generated, do not edit manually)</li>
<li><code>/etc/default/grub</code> — Your editable settings (timeout, cmdline params, resolution)</li>
<li><code>/etc/grub.d/</code> — Scripts that generate grub.cfg when you run <code>update-grub</code></li>
</ul>`,
      code:`<span class="cc"># View current kernel boot parameters (as seen by running kernel)</span>
cat /proc/cmdline

<span class="cc"># Update GRUB config after editing /etc/default/grub</span>
sudo update-grub         <span class="cc"># Debian/Ubuntu</span>
sudo grub2-mkconfig -o /boot/grub2/grub.cfg  <span class="cc"># Fedora/RHEL</span>

<span class="cc"># List installed kernels</span>
ls /boot/vmlinuz*

<span class="cc"># View GRUB menu entries</span>
grep -E "menuentry|submenu" /boot/grub/grub.cfg | head -20

<span class="cc"># Add a kernel parameter permanently (e.g. quiet splash)</span>
<span class="cc"># Edit GRUB_CMDLINE_LINUX_DEFAULT in /etc/default/grub then:</span>
sudo update-grub`
    },
    {
      title:'Stage 3 — Kernel Initialization',
      body:`<p>Once GRUB loads the kernel into RAM and jumps to its entry point, Linux takes over. Kernel initialization is the most hardware-intensive phase of the boot:</p>
<ol>
<li><strong>Decompression</strong> — The kernel image (<code>vmlinuz</code>) decompresses itself from gzip/zstd format into RAM</li>
<li><strong>CPU setup</strong> — Initializes the processor: sets up GDT, IDT, enables paging, switches to protected/long mode</li>
<li><strong>Memory detection</strong> — Reads memory map from UEFI/BIOS, builds the physical page frame database</li>
<li><strong>Hardware discovery</strong> — Probes PCI/PCIe bus, loads built-in drivers, brings up basic devices (storage, network)</li>
<li><strong>initramfs mount</strong> — Mounts the <span class="kw">initramfs</span> (initial RAM filesystem) as a temporary root. This tiny filesystem contains just enough drivers to mount the real root partition</li>
<li><strong>Real root mount</strong> — Finds and mounts the real root filesystem (e.g. ext4 on NVMe). Pivots root from initramfs to real root.</li>
<li><strong>Spawn PID 1</strong> — Executes <code>/sbin/init</code> (which is <code>systemd</code> on modern distros) as the first and only user-space process.</li>
</ol>`,
      chips:[
        {label:'vmlinuz',val:'The compressed kernel binary. "vm" = virtual memory, "linuz" = Linux+z (zipped). Located in /boot/.'},
        {label:'initramfs',val:'Initial RAM filesystem: a cpio archive embedded in /boot/initrd.img. Contains minimal drivers to reach real root.'},
        {label:'dmesg',val:'Ring buffer of kernel log messages. Read with: dmesg | less or journalctl -k (kernel messages only).'},
        {label:'PID 1',val:'The first and only process the kernel directly spawns. All other processes descend from it. On modern Linux: systemd.'},
        {label:'/proc/cmdline',val:'Shows exactly what kernel parameters GRUB passed to this running kernel instance.'},
        {label:'lsmod',val:'Lists all currently loaded kernel modules (drivers loaded dynamically, not compiled in).'}
      ]
    },
    {
      title:'From Kernel to systemd',
      body:`<p>The kernel's final act is executing <code>/sbin/init</code>. On all modern Linux distributions (Ubuntu, Fedora, Debian, Arch, RHEL), <code>/sbin/init</code> is a symlink to <code>systemd</code>. At this point, systemd becomes <span class="kw">PID 1</span> — the parent of every other process on the system.</p>
<p>You can verify this yourself:</p>`,
      code:`<span class="cc"># Confirm /sbin/init is systemd</span>
ls -la /sbin/init
<span class="cc"># Output: /sbin/init -> /lib/systemd/systemd</span>

<span class="cc"># PID 1 is always systemd</span>
ps -p 1 -o pid,comm,args
<span class="cc"># Output: PID  COMMAND  COMMAND</span>
<span class="cc">#           1  systemd  /sbin/init</span>

<span class="cc"># See how long each boot stage took</span>
systemd-analyze

<span class="cc"># Visualize boot times as a graph (creates blame.svg)</span>
systemd-analyze plot > boot-timeline.svg

<span class="cc"># Show which services slowed down boot</span>
systemd-analyze blame | head -20

<span class="cc"># Show critical path (chain of units that determined total boot time)</span>
systemd-analyze critical-chain`
    }
  ],
  quiz:[
    {q:'What does GRUB store its configuration in, and where is the file that you should actually edit?',opts:['Edit /boot/grub/grub.cfg directly','Edit /etc/default/grub and regenerate grub.cfg with update-grub','Edit /proc/grub/config at runtime','Edit /boot/grub/grub.conf on all distros'],ans:1,hint:'GRUB has two files: one that\'s auto-generated (do not touch) and one that\'s your settings file. After editing the settings file, you run a command to regenerate the auto-generated one.'},
    {q:'What is the initramfs and why does the kernel need it?',opts:['A compressed backup of your home directory','A minimal RAM-based filesystem with just enough drivers to mount the real root filesystem','A second kernel that runs in parallel','The kernel\'s configuration file stored in RAM'],ans:1,hint:'The kernel faces a chicken-and-egg problem: it needs drivers to access the storage where the OS lives, but the OS is where the drivers live. The initramfs solves this.'},
    {q:'What is PID 1 on a modern Linux system, and what is special about it?',opts:['Firefox — the first GUI app','bash — the first shell spawned by the kernel','systemd — the first user-space process, parent of all other processes','The kernel itself, which runs as PID 1'],ans:2,hint:'The kernel directly spawns exactly ONE user-space process, and all others descend from it. On modern distros, this is a specific init system.'},
    {q:'What is the difference between BIOS+MBR and UEFI+GPT?',opts:['They are the same technology with different names','UEFI+GPT is modern: supports >2TB disks, 128 partitions, Secure Boot, and .efi files on an ESP partition','BIOS is faster at booting because it skips POST','UEFI can only be used with Windows, not Linux'],ans:1,hint:'The modern firmware standard supports larger disks, more partitions, and has its own bootloader mechanism using a special FAT32 partition.'},
    {q:'What command shows you which systemd services took the most time during boot?',opts:['systemctl list-timers','dmesg --boot-times','systemd-analyze blame','journalctl -b --slow'],ans:2,hint:'systemd has a built-in performance analysis tool. The sub-command that "assigns fault" for boot slowness is named after who to blame.'}
  ]
},

// ─── PART 2: SYSTEMD ARCHITECTURE ────────────────────────────────
{
  id:'systemd', num:'02',
  title:'systemd Architecture',
  subtitle:'How systemd orchestrates the entire Linux system — units, targets, dependencies, parallel startup, and the D-Bus service manager.',
  sections:[
    {
      title:'What Is systemd?',
      body:`<p><span class="kw">systemd</span> is the init system and service manager used by virtually all major Linux distributions since ~2011–2015. It replaces the older SysVinit and Upstart systems. systemd is not just a process launcher — it is a suite of tightly integrated components that manage the entire system lifecycle.</p>
<div class="diagram">
  <div class="diagram-title">systemd Component Suite</div>
  <div class="stack-item stack-active">⚙️ systemd (PID 1) — Core init and service manager</div>
  <div class="stack-arrow">↕ manages</div>
  <div class="stack-item stack-dim">📓 journald — Structured binary logging daemon</div>
  <div class="stack-arrow">↕</div>
  <div class="stack-item stack-dim">🌐 networkd — Network interface configuration</div>
  <div class="stack-arrow">↕</div>
  <div class="stack-item stack-dim">🔌 udevd — Device detection and /dev management</div>
  <div class="stack-arrow">↕</div>
  <div class="stack-item stack-dim">🔑 logind — Login sessions and seat management</div>
  <div class="stack-arrow">↕</div>
  <div class="stack-item stack-dim">🕐 timedated/hostnamed/resolved — System metadata daemons</div>
</div>
<p>All systemd components communicate via <span class="kw">D-Bus</span> — the inter-process message bus. This is why you can run <code>hostnamectl</code> or <code>timedatectl</code> and they just work: they're talking to systemd daemons over D-Bus.</p>`
    },
    {
      title:'Units — The Building Blocks of systemd',
      body:`<p>Everything systemd manages is represented as a <span class="kw">unit</span>. A unit is a configuration file that describes a resource, service, or action. The unit type is indicated by the file extension:</p>`,
      chips:[
        {label:'.service',val:'A daemon or one-shot process. e.g. nginx.service, sshd.service, NetworkManager.service'},
        {label:'.target',val:'A group of units that form a synchronization point. e.g. graphical.target, multi-user.target, network.target'},
        {label:'.socket',val:'A socket that activates a service on demand when a connection arrives. Enables socket activation.'},
        {label:'.timer',val:'A cron-like scheduled job. Triggers a corresponding .service file at defined times or intervals.'},
        {label:'.mount',val:'A filesystem mount point. Equivalent to /etc/fstab but integrated into the dependency graph.'},
        {label:'.device',val:'A kernel device (from udev). Services can depend on device units — e.g., wait for a USB drive.'},
        {label:'.path',val:'Watches a filesystem path and activates a service when files appear or change.'},
        {label:'.slice',val:'A cgroup hierarchy node for resource control. Organizes processes into CPU/memory budgets.'}
      ]
    },
    {
      title:'Unit Files — Anatomy and Sections',
      body:`<p>Unit files live in two locations:</p>
<ul>
<li><code>/lib/systemd/system/</code> — Packaged unit files (do not edit — will be overwritten on updates)</li>
<li><code>/etc/systemd/system/</code> — Your overrides and custom units (takes precedence)</li>
</ul>
<p>To safely modify a packaged unit: <code>sudo systemctl edit nginx.service</code> — creates a drop-in override in <code>/etc/systemd/system/nginx.service.d/override.conf</code>.</p>
<p>A typical <code>.service</code> unit has three sections:</p>`,
      code:`<span class="cc"># Example: /etc/systemd/system/myapp.service</span>

[<span class="cf">Unit</span>]
Description=<span class="cs">My Application Server</span>
Documentation=<span class="cs">https://example.com/docs</span>
After=<span class="cs">network.target postgresql.service</span>   <span class="cc"># Start after these</span>
Requires=<span class="cs">postgresql.service</span>              <span class="cc"># Fail if postgres fails</span>
Wants=<span class="cs">redis.service</span>                   <span class="cc"># Start redis too, but don't fail if it's absent</span>

[<span class="cf">Service</span>]
Type=<span class="cs">exec</span>                             <span class="cc"># Process stays running (not one-shot)</span>
ExecStart=<span class="cs">/usr/bin/myapp --port 8080</span>
ExecReload=<span class="cs">/bin/kill -HUP $MAINPID</span>     <span class="cc"># Signal for config reload</span>
Restart=<span class="cs">on-failure</span>                  <span class="cc"># Auto-restart if it crashes</span>
RestartSec=<span class="cs">5s</span>
User=<span class="cs">myapp</span>                          <span class="cc"># Run as this non-root user</span>
WorkingDirectory=<span class="cs">/opt/myapp</span>
Environment=<span class="cs">NODE_ENV=production</span>

[<span class="cf">Install</span>]
WantedBy=<span class="cs">multi-user.target</span>           <span class="cc"># Enable this unit when entering multi-user mode</span>`
    },
    {
      title:'Targets — Replacing Runlevels',
      body:`<p>systemd uses <span class="kw">targets</span> as the replacement for the old SysVinit concept of runlevels (0–6). A target is a named state of the system that groups together all the units needed to reach that state.</p>`,
      chips:[
        {label:'poweroff.target',val:'Runlevel 0. Shuts down the system and powers off. Maps to old "halt".'},
        {label:'rescue.target',val:'Runlevel 1. Single-user mode. Minimal services, root shell, used for system repair.'},
        {label:'multi-user.target',val:'Runlevel 3. Multi-user networking, no GUI. Equivalent to a Linux server configuration.'},
        {label:'graphical.target',val:'Runlevel 5. multi-user.target + display manager (GDM/SDDM) + desktop session.'},
        {label:'reboot.target',val:'Runlevel 6. Triggers a system reboot.'},
        {label:'emergency.target',val:'Minimal shell before even mounting filesystems. Used for kernel panic recovery.'}
      ]
    },
    {
      title:'Parallel Startup and Dependency Graph',
      body:`<p>One of systemd's most important innovations over SysVinit is <strong>parallel service startup</strong>. SysVinit started services sequentially (one after another). systemd builds a <span class="kw">dependency graph</span> of all units and starts everything that has no unmet dependencies simultaneously.</p>
<p><strong>Key dependency directives:</strong></p>
<ul>
<li><span class="kw">After=</span> / <span class="kw">Before=</span> — Ordering only. "Start me after networking.target" does NOT mean "require networking". It just sets order.</li>
<li><span class="kw">Requires=</span> — Hard dependency. If the required unit fails, this unit fails too.</li>
<li><span class="kw">Wants=</span> — Soft dependency. Start the wanted unit, but continue even if it fails.</li>
<li><span class="kw">BindsTo=</span> — Like Requires, but also stops this unit when the dependency stops.</li>
<li><span class="kw">Conflicts=</span> — Mutual exclusion. Cannot run at the same time.</li>
</ul>
<p><strong>Socket activation</strong> is another key feature: systemd creates the socket (e.g., TCP port 80) before the service starts. Any connection attempt causes systemd to start the service on demand. This means services can start lazily, and multiple services can be "ready" instantly at boot even before their processes are running.</p>`,
      code:`<span class="cc"># Visualize the complete systemd dependency graph</span>
systemctl list-dependencies graphical.target

<span class="cc"># Show which units a service depends on</span>
systemctl list-dependencies nginx.service

<span class="cc"># Show what depends ON a service (reverse)</span>
systemctl list-dependencies --reverse nginx.service

<span class="cc"># Check systemd's view of boot parallelism</span>
systemd-analyze dot | dot -Tsvg > deps.svg

<span class="cc"># Show all active units</span>
systemctl list-units --type=service --state=active`
    }
  ],
  quiz:[
    {q:'What is the difference between "Requires=" and "Wants=" in a systemd unit file?',opts:['They are aliases — both have the same effect','Requires= is a hard dependency (unit fails if required unit fails); Wants= is soft (continues even if wanted unit fails)','Wants= sets startup order; Requires= sets ordering and dependency','Requires= is for .service units; Wants= is only for .target units'],ans:1,hint:'Think about the strength of the dependency. One causes a cascade failure; the other just attempts to start the related unit but keeps going if it\'s not there.'},
    {q:'Where should you place a custom systemd unit file that you want to persist across system updates?',opts:['/lib/systemd/system/ — this is the main location','/etc/systemd/system/ — takes precedence over packaged units','/usr/local/systemd/ — the standard for local units','/proc/systemd/ — in-memory dynamic units'],ans:1,hint:'There are two directories for units. The one in /lib is for packages (gets overwritten). The one in /etc is for your customizations and takes precedence.'},
    {q:'What systemd target is equivalent to a traditional server configuration (multi-user networking, no GUI)?',opts:['graphical.target','network.target','multi-user.target','rescue.target'],ans:2,hint:'Think of the three operational modes: emergency (nothing), single-user (rescue), multi-user CLI (no desktop), and multi-user GUI (full desktop). Which one is CLI+network, no desktop?'},
    {q:'How does systemd improve boot speed compared to SysVinit?',opts:['It skips running non-essential services permanently','It uses a C-compiled binary instead of shell scripts','It builds a dependency graph and starts all units with satisfied dependencies simultaneously (parallel startup)','It loads services into RAM before the kernel finishes initializing'],ans:2,hint:'The key innovation is about whether services start one-at-a-time or many-at-a-time. What algorithmic structure enables starting independent things simultaneously?'},
    {q:'What is socket activation in systemd?',opts:['A feature that requires services to use Unix sockets instead of TCP','systemd creates the socket before the service starts, then launches the service on demand when a connection arrives','A method for services to communicate with each other via PID sockets','The way logind manages user session sockets'],ans:1,hint:'This feature allows services to appear "ready" instantly at boot even before their process is running. What does systemd create first, and what triggers the actual process startup?'}
  ]
},

// ─── PART 3: SYSTEMCTL — MANAGING SERVICES ───────────────────────
{
  id:'systemctl', num:'03',
  title:'Managing Services with systemctl',
  subtitle:'The complete systemctl command reference — starting, stopping, enabling, inspecting, and troubleshooting services in production Linux systems.',
  sections:[
    {
      title:'systemctl — Your Primary Control Interface',
      body:`<p><span class="kw">systemctl</span> is the command-line interface to systemd. It lets you inspect, start, stop, reload, enable, and disable any unit on the system. Mastering <code>systemctl</code> is essential for anyone managing Linux systems.</p>
<p>Every interaction with a running service goes through systemctl, which communicates with the systemd daemon (PID 1) over D-Bus. You don't need to send signals to processes manually anymore — systemctl abstracts all of that.</p>`,
      code:`<span class="cc"># ──────────────────────────────────────────────────
# RUNTIME CONTROL (changes take effect immediately)
# ──────────────────────────────────────────────────</span>
sudo systemctl start nginx       <span class="cc"># Start a stopped service</span>
sudo systemctl stop nginx        <span class="cc"># Stop a running service (SIGTERM)</span>
sudo systemctl restart nginx     <span class="cc"># Stop + start (brief downtime)</span>
sudo systemctl reload nginx      <span class="cc"># Reload config without restart (sends SIGHUP)</span>
sudo systemctl reload-or-restart nginx  <span class="cc"># Reload if supported, restart if not</span>
sudo systemctl kill nginx        <span class="cc"># Send SIGKILL to all processes in unit</span>

<span class="cc"># ──────────────────────────────────────────────────
# PERSISTENCE CONTROL (survives reboots)
# ──────────────────────────────────────────────────</span>
sudo systemctl enable nginx      <span class="cc"># Auto-start at boot (creates symlink in .wants/)</span>
sudo systemctl disable nginx     <span class="cc"># Remove auto-start symlink</span>
sudo systemctl enable --now nginx  <span class="cc"># Enable AND start immediately</span>
sudo systemctl disable --now nginx <span class="cc"># Disable AND stop immediately</span>
sudo systemctl mask nginx        <span class="cc"># Prevent service from ever being started (even manually)</span>
sudo systemctl unmask nginx      <span class="cc"># Restore masked service</span>`
    },
    {
      title:'Inspecting Service State',
      body:`<p>Before changing anything, always inspect the current state. systemctl provides rich diagnostic information about any unit:</p>`,
      code:`<span class="cc"># Show full status: state, PID, memory, recent logs</span>
systemctl status nginx

<span class="cc"># Show only the active state (one word: active/inactive/failed)</span>
systemctl is-active nginx      <span class="cc"># returns 0 if active, non-zero if not</span>
systemctl is-enabled nginx     <span class="cc"># returns 0 if enabled for boot</span>
systemctl is-failed nginx      <span class="cc"># returns 0 if in failed state</span>

<span class="cc"># List ALL service units and their states</span>
systemctl list-units --type=service

<span class="cc"># List only FAILED units (critical for ops)</span>
systemctl list-units --state=failed

<span class="cc"># Show the full unit file content</span>
systemctl cat nginx

<span class="cc"># Show effective (merged) unit properties</span>
systemctl show nginx

<span class="cc"># Show a specific property</span>
systemctl show nginx -p MainPID
systemctl show nginx -p MemoryCurrent`
    },
    {
      title:'journalctl — Reading Service Logs',
      body:`<p>systemd's <span class="kw">journald</span> collects all log output from every service into a structured binary database. <span class="kw">journalctl</span> queries this database with powerful filters.</p>
<p>Unlike traditional syslog (<code>/var/log/*.log</code> text files), journald stores logs with structured metadata: timestamp, PID, UID, unit name, priority level, and more. This enables precise filtering impossible with grep on log files.</p>`,
      code:`<span class="cc"># All logs for a specific service (most useful daily command)</span>
journalctl -u nginx

<span class="cc"># Follow logs in real time (like tail -f)</span>
journalctl -u nginx -f

<span class="cc"># Last 50 lines of service logs</span>
journalctl -u nginx -n 50

<span class="cc"># Logs since last boot only</span>
journalctl -u nginx -b

<span class="cc"># Logs from a specific time range</span>
journalctl -u nginx --since "2024-01-15 10:00" --until "2024-01-15 11:00"
journalctl -u nginx --since "1 hour ago"

<span class="cc"># Only error-level and above (0=emergency, 3=error, 7=debug)</span>
journalctl -u nginx -p err

<span class="cc"># Kernel messages only</span>
journalctl -k

<span class="cc"># ALL logs from this boot</span>
journalctl -b

<span class="cc"># Disk usage of journal</span>
journalctl --disk-usage`
    },
    {
      title:'Creating and Overriding Units',
      body:`<p>One of systemd's most powerful features is the ability to customize any service without modifying the package's unit file (which would be overwritten on updates). <strong>Drop-in overrides</strong> let you change specific settings while inheriting everything else.</p>`,
      code:`<span class="cc"># SAFE WAY: Edit a unit (creates a drop-in override)</span>
sudo systemctl edit nginx
<span class="cc"># Opens an editor. Creates /etc/systemd/system/nginx.service.d/override.conf</span>
<span class="cc"># You only need to write the sections/keys you want to CHANGE</span>

<span class="cc"># Example override.conf to increase file descriptor limit:</span>
<span class="cc"># [Service]</span>
<span class="cc"># LimitNOFILE=65536</span>

<span class="cc"># FULL OVERRIDE: Edit the complete unit (replaces the package unit entirely)</span>
sudo systemctl edit --full nginx

<span class="cc"># After ANY unit file change, reload the daemon</span>
sudo systemctl daemon-reload

<span class="cc"># Create a brand new service unit:</span>
sudo tee /etc/systemd/system/backup.service &lt;&lt; 'EOF'
[Unit]
Description=Daily Backup Job
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/backup.sh
User=backup

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now backup.service`
    },
    {
      title:'Timers — Replacing cron',
      body:`<p>systemd <span class="kw">timers</span> are the modern replacement for cron jobs. A timer is a <code>.timer</code> unit that activates a corresponding <code>.service</code> unit on a schedule. Timers have several advantages over cron: logs go to journald, they have proper dependency management, and they support monotonic clocks (run X minutes after boot, rather than at a calendar time).</p>`,
      code:`<span class="cc"># Example: Run a backup every day at 2AM</span>

<span class="cc"># 1. Create the service unit</span>
sudo tee /etc/systemd/system/nightly-backup.service &lt;&lt; 'EOF'
[Unit]
Description=Nightly database backup

[Service]
Type=oneshot
ExecStart=/opt/scripts/backup-db.sh
User=postgres
EOF

<span class="cc"># 2. Create the timer unit</span>
sudo tee /etc/systemd/system/nightly-backup.timer &lt;&lt; 'EOF'
[Unit]
Description=Run nightly backup at 02:00

[Timer]
OnCalendar=*-*-* 02:00:00   <span class="cc"># every day at 2AM</span>
Persistent=true              <span class="cc"># run missed jobs after downtime</span>

[Install]
WantedBy=timers.target
EOF

<span class="cc"># Enable the TIMER (not the service — timer starts the service)</span>
sudo systemctl daemon-reload
sudo systemctl enable --now nightly-backup.timer

<span class="cc"># List all active timers and when they will next run</span>
systemctl list-timers`
    }
  ],
  quiz:[
    {q:'What is the difference between "systemctl start nginx" and "systemctl enable nginx"?',opts:['They are the same command with different syntax','start runs nginx now; enable makes it auto-start on every boot (but does not start it now)','enable does both start and start-on-boot; start is redundant','start is for user services; enable is for system services'],ans:1,hint:'Think about time horizon: one affects what\'s happening right now, the other affects what happens every time the machine reboots.'},
    {q:'You edited a unit file at /etc/systemd/system/myapp.service. What must you run before the change takes effect?',opts:['sudo reboot','sudo systemctl restart systemd','sudo systemctl daemon-reload','The change is applied automatically when you save the file'],ans:2,hint:'systemd caches unit file data in memory. After editing unit files on disk, you need to tell systemd to re-read them with a specific command.'},
    {q:'What does "systemctl mask nginx" do that "systemctl disable nginx" does not?',opts:['mask removes the binary; disable only stops auto-start','mask creates a /dev/null symlink preventing ANY start (even manual); disable only removes the auto-start boot symlink','mask is permanent; disable is only until next reboot','They have identical effects — "mask" is just an alias'],ans:1,hint:'Disabling just removes the boot link. But what if someone accidentally runs systemctl start? Masking goes further — it prevents even manual starts by pointing the unit at a special target.'},
    {q:'Which journalctl command shows only the last 50 lines of nginx logs, following new output in real time?',opts:['journalctl -u nginx -n 50 --follow','journalctl -u nginx -n 50 -f','journalctl --tail=50 -u nginx --realtime','journalctl -u nginx --live --last 50'],ans:1,hint:'Two flags needed: one to limit to last N lines, one to follow/tail. Both flags are single-letter and start with common Unix conventions.'},
    {q:'What is the advantage of a systemd .timer unit over a traditional cron job?',opts:['Timers run faster because they use kernel interrupts','Timers have no advantage — cron is simpler and preferred','Timer logs go to journald, support dependency management, can run missed jobs after downtime, and integrate with systemctl','Timers use less CPU because they are written in C']  ,ans:2,hint:'Think about what cron lacks: where do the logs go? What if the machine was off when the job should have run? How do you view whether the job is running?'}
  ]
},

// ─── PART 4: LINUX FILESYSTEM & PROCESSES BASICS ─────────────────
{
  id:'filesystem', num:'04',
  title:'Filesystem & Process Basics',
  subtitle:'The Filesystem Hierarchy Standard, how Linux organizes directories, file permissions, and how processes are created and communicate.',
  sections:[
    {
      title:'The Filesystem Hierarchy Standard (FHS)',
      body:`<p>Linux follows the <span class="kw">Filesystem Hierarchy Standard (FHS)</span> — a specification that defines the directory structure and content. Every file has a designated location. Knowing the FHS means you always know where to look for configuration, binaries, logs, and runtime data.</p>
<p><strong>The most important directories:</strong></p>`,
      chips:[
        {label:'/ (root)',val:'The top of the filesystem tree. Every file and directory lives under /. The root filesystem is mounted first by the kernel.'},
        {label:'/bin, /sbin',val:'Essential user and system binaries (ls, cp, mount, systemd). On modern distros, symlinked to /usr/bin and /usr/sbin.'},
        {label:'/etc',val:'System-wide configuration files. Human-readable text. /etc/passwd (users), /etc/fstab (mounts), /etc/hosts (DNS).'},
        {label:'/home',val:'User home directories: /home/alice, /home/bob. Personal files, dotfiles (.bashrc, .config/), and user data.'},
        {label:'/var',val:'Variable data that changes during operation: /var/log (logs), /var/lib (app state), /var/spool (queues), /var/tmp (temp persists reboots).'},
        {label:'/tmp',val:'Temporary files. Cleared on reboot (or by systemd-tmpfiles on a schedule). World-writable but sticky bit prevents deletion of others\' files.'},
        {label:'/proc',val:'Virtual filesystem — not on disk. Kernel exposes process info and settings here. /proc/1/status = PID 1 details. /proc/cpuinfo = CPU info.'},
        {label:'/sys',val:'Virtual filesystem for kernel/hardware. sysfs: expose device trees, driver parameters. e.g. /sys/class/net/eth0/speed = NIC speed.'},
        {label:'/dev',val:'Device files managed by udev. /dev/sda (first disk), /dev/null (bit bucket), /dev/urandom (random bytes), /dev/tty (terminal).'},
        {label:'/usr',val:'User programs and libraries: /usr/bin (all user binaries), /usr/lib (libraries), /usr/share (arch-independent data, man pages).'},
        {label:'/boot',val:'Bootloader files: vmlinuz (kernel), initrd.img (initramfs), grub/ (GRUB config). Mounted separately before root in some configs.'},
        {label:'/run',val:'Runtime data since last boot: PID files, sockets, lock files. Stored in tmpfs — lost on reboot. Replaces /var/run and /var/lock.'}
      ]
    },
    {
      title:'File Permissions and Ownership',
      body:`<p>Every file and directory in Linux has an <strong>owner</strong> (a user), a <strong>group</strong>, and three sets of <span class="kw">permission bits</span>. This is the cornerstone of Linux multi-user security.</p>
<p>When you run <code>ls -la</code>, you see: <code>-rwxr-xr-- 1 alice devs 4096 Jan 15 09:30 script.sh</code></p>
<ul>
<li><code>-</code> — File type: <code>-</code>=regular file, <code>d</code>=directory, <code>l</code>=symlink, <code>b</code>=block device, <code>c</code>=char device</li>
<li><code>rwx</code> — Owner (alice) permissions: read, write, execute</li>
<li><code>r-x</code> — Group (devs) permissions: read, no-write, execute</li>
<li><code>r--</code> — Others (world) permissions: read only</li>
</ul>
<p><strong>Permission values (octal):</strong> <span class="kw">r=4, w=2, x=1</span>. So <code>rwxr-xr--</code> = 754. The full octal notation: <code>chmod 754 script.sh</code>.</p>
<p><strong>Special bits:</strong></p>
<ul>
<li><strong>setuid (4xxx)</strong> — Execute as the file's owner. Used by <code>sudo</code>, <code>passwd</code>. e.g. <code>chmod 4755 /usr/bin/sudo</code></li>
<li><strong>setgid (2xxx)</strong> — On directories: new files inherit the directory's group. Used for shared project directories.</li>
<li><strong>sticky bit (1xxx)</strong> — On directories: users can only delete their own files. Used on <code>/tmp</code>.</li>
</ul>`,
      code:`<span class="cc"># Change file ownership</span>
sudo chown alice:devs script.sh       <span class="cc"># user:group</span>
sudo chown -R alice /home/alice/      <span class="cc"># recursive</span>

<span class="cc"># Change permissions (symbolic mode)</span>
chmod u+x script.sh       <span class="cc"># add execute for owner</span>
chmod go-w config.txt     <span class="cc"># remove write from group and others</span>
chmod a=r readonly.txt    <span class="cc"># set all to read-only</span>

<span class="cc"># Change permissions (octal mode)</span>
chmod 755 script.sh       <span class="cc"># rwxr-xr-x  (standard executable)</span>
chmod 644 config.txt      <span class="cc"># rw-r--r--  (standard config file)</span>
chmod 600 ~/.ssh/id_rsa   <span class="cc"># rw-------  (private key, must be owner-only)</span>
chmod 700 ~/.ssh          <span class="cc"># rwx------  (private directory)</span>

<span class="cc"># Find all setuid binaries (security audit)</span>
find / -perm -4000 -type f 2>/dev/null`
    },
    {
      title:'Process Management Basics',
      body:`<p>Every running program is a <strong>process</strong>. The kernel tracks each process in a data structure called the <span class="kw">process descriptor</span>. Key process concepts every Linux user needs:</p>
<p><strong>Process hierarchy:</strong> Processes form a tree rooted at PID 1 (systemd). Every process has a parent (<span class="kw">PPID</span>). When a parent dies, orphan processes are adopted by PID 1.</p>
<p><strong>Fork-exec model:</strong> New processes are created via <span class="kw">fork()</span> (copy the parent) followed by <span class="kw">exec()</span> (replace with a new program). There is no other way to create a process in Linux.</p>
<p><strong>Process states:</strong></p>
<ul>
<li><strong>R (Running/Runnable)</strong> — Currently executing on a CPU or ready to run</li>
<li><strong>S (Sleeping/Interruptible)</strong> — Waiting for I/O or an event. Most processes are here most of the time.</li>
<li><strong>D (Uninterruptible sleep)</strong> — Waiting for I/O that cannot be interrupted (usually disk/NFS). High D-state count = I/O bottleneck.</li>
<li><strong>Z (Zombie)</strong> — Process finished but parent hasn't called wait(). The PID entry remains. Harmless if rare.</li>
<li><strong>T (Stopped)</strong> — Paused by SIGSTOP (Ctrl+Z). Resumes with SIGCONT (fg command).</li>
</ul>`,
      code:`<span class="cc"># View all processes (snapshot)</span>
ps aux                     <span class="cc"># All processes, user-friendly columns</span>
ps -ef                     <span class="cc"># Full format with PPID</span>

<span class="cc"># Real-time process monitor</span>
top                        <span class="cc"># Classic. Press q to quit, k to kill by PID.</span>
htop                       <span class="cc"># Modern. Interactive, color-coded. Install separately.</span>

<span class="cc"># Process tree (shows parent-child relationships)</span>
pstree -p                  <span class="cc"># With PIDs</span>
pstree -p 1                <span class="cc"># Only descendants of PID 1 (systemd)</span>

<span class="cc"># Find PID of a running program</span>
pidof nginx                <span class="cc"># Returns all PIDs of nginx processes</span>
pgrep -l nginx             <span class="cc"># Returns PID + name, supports patterns</span>

<span class="cc"># Send signals to processes</span>
kill 1234                  <span class="cc"># Send SIGTERM (15) — graceful shutdown request</span>
kill -9 1234               <span class="cc"># Send SIGKILL — forceful, cannot be caught</span>
kill -HUP 1234             <span class="cc"># SIGHUP (1) — reload config convention</span>
killall nginx              <span class="cc"># Send SIGTERM to all processes named nginx</span>
pkill -f "python.*server"  <span class="cc"># Kill by matching command line pattern</span>`
    },
    {
      title:'/proc — The Process Virtual Filesystem',
      body:`<p>The <span class="kw">/proc</span> filesystem is a virtual filesystem the kernel exposes in memory. It contains no actual files on disk — the kernel generates its contents on-the-fly when you read from it. Understanding /proc is key for advanced diagnostics.</p>
<p><strong>Per-process information at <code>/proc/[PID]/</code>:</strong></p>`,
      chips:[
        {label:'/proc/[PID]/status',val:'Process state, UID, GID, memory usage (VmRSS = resident RAM), thread count.'},
        {label:'/proc/[PID]/cmdline',val:'The exact command line used to start this process (null-byte separated args).'},
        {label:'/proc/[PID]/fd/',val:'Symlinks to every open file descriptor. fd/0=stdin, fd/1=stdout, fd/2=stderr, fd/3+=files.'},
        {label:'/proc/[PID]/maps',val:'Virtual memory map: every mapped region — code, libraries, heap, stack, mmap regions.'},
        {label:'/proc/[PID]/net/',val:'Network statistics: open connections (tcp, tcp6, udp), socket states, interface stats.'},
        {label:'/proc/cpuinfo',val:'Every CPU core\'s model, MHz, cache size, and feature flags (avx2, aes, vmx, etc.).'},
        {label:'/proc/meminfo',val:'RAM totals: MemTotal, MemFree, MemAvailable, Buffers, Cached, SwapTotal, SwapFree.'},
        {label:'/proc/sys/',val:'Tunable kernel parameters. e.g. /proc/sys/net/ipv4/ip_forward — enable IP forwarding.'}
      ]
    },
    {
      title:'Users, Groups, and sudo',
      body:`<p>Linux is a multi-user operating system. Every process runs as a specific user with a specific <span class="kw">UID (User ID)</span>. Understanding users and privilege escalation is fundamental to security.</p>
<p><strong>Key files:</strong></p>
<ul>
<li><code>/etc/passwd</code> — User accounts: username:x:UID:GID:comment:home:shell (password hash is in /etc/shadow)</li>
<li><code>/etc/shadow</code> — Password hashes (root-only readable)</li>
<li><code>/etc/group</code> — Group definitions and membership</li>
<li><code>/etc/sudoers</code> — Who can run what as root. Always edit via <code>visudo</code> (validates syntax)</li>
</ul>`,
      code:`<span class="cc"># Show current user, UID, GID, and group memberships</span>
id
<span class="cc"># Output: uid=1000(alice) gid=1000(alice) groups=1000(alice),4(adm),27(sudo),1001(docker)</span>

<span class="cc"># Create a new user with home directory and bash shell</span>
sudo useradd -m -s /bin/bash -c "Bob Smith" bob
sudo passwd bob           <span class="cc"># Set bob's password</span>

<span class="cc"># Add user to a group (e.g., docker group for Docker access)</span>
sudo usermod -aG docker alice  <span class="cc"># -a = append (don't remove other groups!)</span>

<span class="cc"># Switch to another user</span>
su - bob                  <span class="cc"># Full login shell as bob (- loads their environment)</span>
sudo -u bob command       <span class="cc"># Run a single command as bob</span>
sudo -i                   <span class="cc"># Interactive root shell (full root environment)</span>

<span class="cc"># Show sudo privileges for current user</span>
sudo -l

<span class="cc"># Lock/unlock a user account</span>
sudo usermod -L bob       <span class="cc"># Lock (prevents password login)</span>
sudo usermod -U bob       <span class="cc"># Unlock</span>`
    }
  ],
  quiz:[
    {q:'What is the purpose of the /proc filesystem in Linux?',opts:['It stores process backup files for crash recovery','It is a virtual kernel-generated filesystem that exposes runtime process and system information','It is where new processes are created and stored before they run','It holds process log files managed by journald'],ans:1,hint:'Think "virtual" — these aren\'t real files on disk. The kernel generates their contents when you read them. They reveal what\'s happening inside the running system.'},
    {q:'A file has permissions "rwxr-xr--". What is the octal representation of these permissions?',opts:['777','755','754','744'],ans:2,hint:'Break it into three groups of 3: owner (rwx), group (r-x), others (r--). Convert each: r=4, w=2, x=1, -=0. Add them up for each group.'},
    {q:'What does the sticky bit do when set on a directory like /tmp?',opts:['Files in the directory cannot be deleted at all','Only the file\'s owner (or root) can delete their own files, even if others have write permission on the directory','All files become read-only','Only root can create files in the directory'],ans:1,hint:'The sticky bit solves a specific problem with world-writable directories. Without it, anyone with write permission on the directory could delete anyone else\'s files.'},
    {q:'A process is in state "D" (uninterruptible sleep). What does this indicate?',opts:['The process is in debug mode and can be paused','The process is waiting for I/O and cannot be interrupted — usually a disk or NFS I/O bottleneck','The process is a daemon running in the background','The process has been deliberately stopped with Ctrl+Z'],ans:1,hint:'State D is special because SIGKILL won\'t even work on these processes. They\'re deep in the kernel waiting for hardware. A high count of D-state processes always points to a specific bottleneck.'},
    {q:'What is the correct and safe way to edit the /etc/sudoers file?',opts:['sudo nano /etc/sudoers','sudo vim /etc/sudoers','sudo visudo — it validates syntax before saving to prevent locking yourself out','sudo chmod 777 /etc/sudoers then edit normally'],ans:2,hint:'If you corrupt this file with a typo and save it, you could permanently lose sudo access. The safe way uses a wrapper tool that validates the syntax before saving changes.'}
  ]
},

// ─── PART 5: NETWORKING, STORAGE & LINUX THEORY SYNTHESIS ────────
{
  id:'synthesis', num:'05',
  title:'Networking, Storage & System Theory',
  subtitle:'Linux networking fundamentals, storage concepts (block devices, filesystems, LVM), and a synthesis of the full system architecture.',
  sections:[
    {
      title:'Linux Networking Fundamentals',
      body:`<p>Linux has one of the most powerful and flexible networking stacks of any operating system. Understanding the basics — interfaces, IP addresses, routing, and sockets — is essential for any Linux user.</p>
<p><strong>Network interfaces</strong> are the kernel's abstraction for network devices. Each has a name (<code>eth0</code>, <code>ens3</code>, <code>wlan0</code>, <code>lo</code>) and can be configured with IP addresses, MTU, and flags.</p>`,
      code:`<span class="cc"># Modern interface management (iproute2 suite)</span>
ip addr show                     <span class="cc"># Show all interfaces and IPs</span>
ip addr show ens3                <span class="cc"># Show specific interface</span>
ip link show                     <span class="cc"># Show link-layer info (MAC, state)</span>

<span class="cc"># Assign an IP address (temporary — lost after reboot)</span>
sudo ip addr add 192.168.1.100/24 dev ens3
sudo ip link set ens3 up         <span class="cc"># Bring interface UP</span>

<span class="cc"># Routing table</span>
ip route show                    <span class="cc"># Show routing table</span>
ip route add default via 192.168.1.1   <span class="cc"># Set default gateway</span>

<span class="cc"># DNS and connectivity testing</span>
ping -c 4 8.8.8.8                <span class="cc"># Test connectivity (ICMP echo)</span>
traceroute 8.8.8.8               <span class="cc"># Trace packet path (hop-by-hop)</span>
dig google.com                   <span class="cc"># DNS query — full response</span>
nslookup google.com              <span class="cc"># Simple DNS lookup</span>
cat /etc/resolv.conf             <span class="cc"># Current DNS resolver config</span>

<span class="cc"># Socket and connection inspection (ss replaces netstat)</span>
ss -tlnp                         <span class="cc"># TCP listening sockets with process names</span>
ss -tunap                        <span class="cc"># All TCP+UDP connections</span>
ss -tlnp | grep :80              <span class="cc"># What is listening on port 80?</span>`
    },
    {
      title:'Block Devices and Filesystems',
      body:`<p>Linux accesses storage as <span class="kw">block devices</span> — devices that read and write fixed-size blocks. Understanding the storage stack from physical drive to mounted filesystem is essential for system administration.</p>
<p><strong>The storage stack:</strong></p>
<ol>
<li><strong>Physical device</strong> — NVMe SSD, SATA HDD, USB drive</li>
<li><strong>Kernel block device</strong> — Represented as <code>/dev/sda</code>, <code>/dev/nvme0n1</code> etc. by udev</li>
<li><strong>Partitions</strong> — <code>/dev/sda1</code>, <code>/dev/nvme0n1p1</code> etc. (sub-divisions of the device)</li>
<li><strong>Optional: LVM or RAID</strong> — Logical volume management over physical partitions</li>
<li><strong>Filesystem</strong> — ext4, xfs, btrfs, vfat — organizes data into files and directories</li>
<li><strong>Mount point</strong> — Attached to a directory in the filesystem tree (e.g., <code>/</code>, <code>/home</code>)</li>
</ol>`,
      chips:[
        {label:'ext4',val:'Default Linux filesystem. Journaling prevents corruption on crash. 1EB max volume, 16TB max file. Mature and reliable.'},
        {label:'xfs',val:'High-performance journaling FS. Excellent for large files and parallel I/O. Default on RHEL/CentOS. Online resize (grow only).'},
        {label:'btrfs',val:'Modern copy-on-write FS: snapshots, checksums, transparent compression, RAID built-in. Default on openSUSE, Fedora.'},
        {label:'vfat/FAT32',val:'The /boot/efi (EFI System Partition) is always FAT32 — required by UEFI spec. Also used on USB drives for cross-OS compatibility.'},
        {label:'tmpfs',val:'RAM-based virtual filesystem. /run, /tmp are tmpfs. Data lost on unmount/reboot. Extremely fast — limited by RAM.'},
        {label:'LVM',val:'Logical Volume Manager: abstract physical disks/partitions into flexible logical volumes. Resize online, snapshots, spanning multiple disks.'}
      ]
    },
    {
      title:'Mounting Filesystems',
      body:`<p>In Linux, a filesystem must be <span class="kw">mounted</span> — attached to a directory — before you can access its contents. <code>/etc/fstab</code> defines which filesystems to mount automatically at boot.</p>`,
      code:`<span class="cc"># Mount a filesystem temporarily</span>
sudo mount /dev/sdb1 /mnt/data
sudo mount -t ext4 /dev/sdb1 /mnt/data   <span class="cc"># explicitly specify type</span>
sudo mount -o ro /dev/sdb1 /mnt/data     <span class="cc"># mount read-only</span>

<span class="cc"># Unmount</span>
sudo umount /mnt/data       <span class="cc"># by mount point</span>
sudo umount /dev/sdb1       <span class="cc"># by device</span>

<span class="cc"># Show all currently mounted filesystems</span>
mount | column -t
lsblk                       <span class="cc"># Block device tree with mount points</span>
findmnt                     <span class="cc"># Tree view of mount points</span>

<span class="cc"># Check disk usage</span>
df -hT                      <span class="cc"># Disk free: all mounts with filesystem type</span>
du -sh /var/log/*            <span class="cc"># Directory sizes</span>
du -sh /* 2>/dev/null | sort -hr | head  <span class="cc"># Largest directories in /</span>

<span class="cc"># /etc/fstab entry format:</span>
<span class="cc"># DEVICE    MOUNT_POINT   FS_TYPE   OPTIONS       DUMP   FSCK_ORDER</span>
<span class="cc"># UUID=abc  /home         ext4      defaults,rw   0      2</span>

<span class="cc"># Get UUID of a device (use UUID in fstab for stability, not /dev/sda1)</span>
blkid /dev/sda1`
    },
    {
      title:'Signals — Inter-Process Communication',
      body:`<p><span class="kw">Signals</span> are asynchronous notifications sent by the kernel or other processes to a process. They are the simplest form of inter-process communication (IPC) in Linux. Every signal has a number, a default action, and most can be caught (handled by custom code) or ignored.</p>
<p><strong>The signals every Linux user must know:</strong></p>`,
      chips:[
        {label:'SIGTERM (15)',val:'Default kill signal. "Please exit gracefully." Process can catch and clean up. Default of kill command.'},
        {label:'SIGKILL (9)',val:'"Die immediately." Cannot be caught, blocked, or ignored. Kernel forcefully terminates. No cleanup possible. Last resort only.'},
        {label:'SIGHUP (1)',val:'Originally "terminal hangup." Convention: reload configuration. Used by nginx, sshd, etc.: kill -HUP to reload without restart.'},
        {label:'SIGINT (2)',val:'Interrupt from keyboard. What Ctrl+C sends to the foreground process. Politely asks process to stop.'},
        {label:'SIGSTOP / SIGCONT',val:'Stop and continue process execution. Ctrl+Z sends SIGSTOP (pause). fg/bg send SIGCONT (resume).'},
        {label:'SIGSEGV (11)',val:'Segmentation fault. Process accessed invalid memory. Default action: terminate + core dump. Indicates a bug.'},
        {label:'SIGUSR1/USR2',val:'User-defined signals. Programs use them for custom actions. e.g., nginx uses SIGUSR1 to reopen log files.'},
        {label:'SIGCHLD',val:'Sent to parent when a child process exits or stops. Parents use this to call wait() and reap zombie processes.'}
      ]
    },
    {
      title:'The Full Linux System Architecture',
      body:`<p>You have now covered the complete Linux system from UI to boot to services. Here is how every module fits together into one coherent picture:</p>
<div class="diagram">
  <div class="diagram-title">Complete Linux System Architecture</div>
  <div class="stack-item stack-active">👤 Module 1 — Applications, Desktop Environment, Window System, Display Manager</div>
  <div class="stack-arrow">↑ started by systemd (gdm.service, graphical.target)</div>
  <div class="stack-item stack-active">⚙️ Module 2 — systemd (PID 1): services, targets, timers, logging</div>
  <div class="stack-arrow">↑ kernel spawns systemd after mounting root fs</div>
  <div class="stack-item stack-dim">🐧 Linux Kernel: scheduler, memory mgr, VFS, networking stack</div>
  <div class="stack-arrow">↑ kernel loaded by GRUB, decompresses, probes hardware</div>
  <div class="stack-item stack-dim">📀 GRUB bootloader: loads vmlinuz + initramfs from /boot</div>
  <div class="stack-arrow">↑ UEFI/BIOS locates and executes GRUB</div>
  <div class="stack-item stack-dim">🔧 UEFI/BIOS firmware: POST, finds boot device, loads bootloader</div>
  <div class="stack-arrow">↑ power on</div>
  <div class="stack-item stack-dim">🔌 Hardware: CPU, RAM, NVMe, GPU, Network</div>
</div>
<p>Every layer you've learned has a direct relationship with every other. The Display Manager (Module 1) is a systemd service (Module 2). systemd reads unit files from the filesystem (Module 2, Part 4). The filesystem lives on block devices accessed by the kernel. The kernel was loaded by GRUB. GRUB was found by UEFI firmware. UEFI runs on the hardware your CPU powers up.</p>
<p><strong>This is Linux: a transparent, layered, fully inspectable system where you can trace any event from a mouse click all the way down to a hardware interrupt.</strong></p>`,
      code:`<span class="cc"># ─────────────────────────────────────────────────────
# SYNTHESIS: Explore the entire live system
# ─────────────────────────────────────────────────────</span>

<span class="cc"># Boot timeline: firmware → kernel → systemd → services</span>
systemd-analyze
systemd-analyze blame | head -15

<span class="cc"># Full process tree from systemd downward</span>
systemctl status  <span class="cc"># overview of system state</span>
pstree -p 1       <span class="cc"># all processes from PID 1</span>

<span class="cc"># Active services and their cgroup resource usage</span>
systemd-cgls        <span class="cc"># hierarchical cgroup tree</span>
systemd-cgtop       <span class="cc"># real-time resource usage per service</span>

<span class="cc"># Storage: full picture from drives to mount points</span>
lsblk -f             <span class="cc"># block devices with filesystem types and UUIDs</span>
findmnt --real       <span class="cc"># all real (non-virtual) mount points</span>

<span class="cc"># Network: interfaces, routes, listening sockets</span>
ip -brief addr       <span class="cc"># compact interface + IP summary</span>
ss -tlnp             <span class="cc"># what's listening on which ports</span>

<span class="cc"># Kernel ring buffer: hardware init messages from this boot</span>
dmesg | grep -E 'nvme|eth|wlan|usb|error' | head -30

<span class="cc"># Everything the kernel knows about this system</span>
uname -a             <span class="cc"># kernel version, arch, hostname</span>
cat /proc/version    <span class="cc"># detailed kernel build info</span>
hostnamectl          <span class="cc"># systemd's view of system identity</span>`
    }
  ],
  quiz:[
    {q:'What command replaces the old "netstat" and shows all TCP listening sockets with the process names?',opts:['netstat -tlnp','ip socket list --tcp','ss -tlnp','nmap localhost'],ans:2,hint:'The modern replacement for netstat is a two-letter command from the iproute2 suite. The flags are similar to netstat: t=tcp, l=listening, n=numeric, p=process.'},
    {q:'You want to mount /dev/sdb1 at /mnt/backup automatically at boot. Where do you configure this?',opts:['In /etc/rc.local as a mount command','In /etc/systemd/system/boot.service','In /etc/fstab — the filesystem table read at boot','By running systemctl enable mount@sdb1'],ans:2,hint:'There is a long-standing Unix/Linux configuration file specifically for persistent filesystem mount definitions. It\'s been there since the early days of Unix.'},
    {q:'What is the difference between SIGTERM and SIGKILL?',opts:['They are identical — both immediately terminate the process','SIGTERM is politely ignored; SIGKILL is the only way to stop a process','SIGTERM requests graceful shutdown (can be caught/handled); SIGKILL forces immediate termination and cannot be caught','SIGTERM is for system processes; SIGKILL is only for user processes'],ans:2,hint:'One signal is a request that the process can choose to handle or clean up after; the other is an unconditional kernel action that the process has no ability to catch or block.'},
    {q:'What does the "lsblk" command show?',opts:['Lists all loadable kernel block modules','Shows a tree of block devices (disks, partitions) with sizes, types, and mount points','Lists the last block of data written to disk','Shows block-level network packet statistics'],ans:1,hint:'Think "ls" (list) + "blk" (block). It shows the hierarchy of storage devices — from physical drives down to partitions and their mount points.'},
    {q:'A process that has finished but whose parent hasn\'t called wait() is called a what?',opts:['Orphan process','Daemon process','Zombie process','Signal-blocked process'],ans:2,hint:'There\'s a specific name for a process that has "died" but still occupies a PID entry in the process table because the kernel is waiting for the parent to acknowledge the death. It comes from a horror movie concept.'}
  ]
}
];

const MODULE3 = [

// ─── PART 1: NAVIGATION & FILE MANAGEMENT ────────────────────────
{
  id:'nav-files', num:'01',
  title:'Navigation & File Management',
  subtitle:'Master the terminal\'s most essential commands — moving through the filesystem, creating, copying, moving, and finding files with precision and speed.',
  sections:[
    {
      title:'How the Linux Filesystem is Structured',
      body:`<p>Before typing a single command, understand what you're navigating. Linux has a single unified directory tree rooted at <span class="kw">/</span> (forward slash). Unlike Windows with drive letters (C:\\, D:\\), everything on Linux — disks, USB drives, network shares — is mounted somewhere under this single root.</p>
<div class="diagram">
  <div class="diagram-title">The Linux Filesystem Hierarchy (FHS)</div>
  <div class="stack-item stack-active">/ — Root: the top of everything. All paths begin here.</div>
  <div class="stack-arrow">├── /home — User home directories (/home/alice, /home/bob)</div>
  <div class="stack-arrow">├── /etc — System-wide configuration files (text files, human readable)</div>
  <div class="stack-arrow">├── /var — Variable data: logs (/var/log), databases, mail spools</div>
  <div class="stack-arrow">├── /usr — User programs: /usr/bin (commands), /usr/lib (libraries)</div>
  <div class="stack-arrow">├── /tmp — Temporary files, cleared at boot (world-writable)</div>
  <div class="stack-arrow">├── /proc — Virtual: live kernel + process data (not on disk)</div>
  <div class="stack-arrow">├── /dev — Device files: /dev/sda (disk), /dev/null (black hole)</div>
  <div class="stack-arrow">└── /boot — Kernel (vmlinuz), initrd, GRUB config</div>
</div>
<p>Your <strong>current working directory</strong> is the folder you are "in" right now. Every command you run operates relative to this location. The shell prompt usually shows it, but <span class="kw">pwd</span> always confirms it.</p>`
    },
    {
      title:'Level 1 — Core Navigation Commands',
      body:`<p>These are the commands you will type hundreds of times every day. Learn their options deeply.</p>`,
      code:`<span class="cc"># pwd — print working directory. Always know where you are.</span>
pwd
<span class="cc"># Output: /home/alice</span>

<span class="cc"># cd — change directory</span>
cd /etc                 <span class="cc"># absolute path (starts with /)</span>
cd Documents            <span class="cc"># relative path (relative to current dir)</span>
cd ..                   <span class="cc"># go up one level (parent directory)</span>
cd ../..                <span class="cc"># go up two levels</span>
cd ~                    <span class="cc"># go to your home directory (~)</span>
cd -                    <span class="cc"># go back to previous directory (toggle)</span>

<span class="cc"># ls — list directory contents</span>
ls                      <span class="cc"># basic listing</span>
ls -l                   <span class="cc"># long format: permissions, owner, size, date</span>
ls -la                  <span class="cc"># long format + hidden files (dotfiles)</span>
ls -lh                  <span class="cc"># human-readable sizes (KB, MB, GB)</span>
ls -lt                  <span class="cc"># sorted by modification time (newest first)</span>
ls -lS                  <span class="cc"># sorted by file size (largest first)</span>
ls /etc/*.conf          <span class="cc"># list only .conf files in /etc using glob</span>
ls -R /etc/nginx        <span class="cc"># recursive listing of all files in subdirs</span>`
    },
    {
      title:'Level 2 — Creating & Removing Files and Directories',
      body:`<p>File and directory manipulation is the backbone of system work. Notice how Linux commands are designed to be composable — each does one thing well.</p>`,
      code:`<span class="cc"># mkdir — make directory</span>
mkdir projects                     <span class="cc"># create one directory</span>
mkdir -p projects/web/css          <span class="cc"># create nested dirs in one shot (-p = parents)</span>
mkdir -m 700 private               <span class="cc"># create with specific permissions</span>

<span class="cc"># touch — create empty file or update timestamp</span>
touch notes.txt                    <span class="cc"># create empty file</span>
touch -t 202401011200 report.txt   <span class="cc"># set specific timestamp</span>

<span class="cc"># cp — copy files and directories</span>
cp file.txt backup.txt             <span class="cc"># copy file to new name (same dir)</span>
cp file.txt /tmp/                  <span class="cc"># copy to different directory</span>
cp -r mydir/ /backup/mydir         <span class="cc"># copy directory recursively (-r is required)</span>
cp -rp mydir/ /backup/             <span class="cc"># -p preserves permissions + timestamps</span>
cp -u *.log /backup/               <span class="cc"># -u only copies if source is newer</span>

<span class="cc"># mv — move or rename</span>
mv oldname.txt newname.txt         <span class="cc"># rename a file</span>
mv report.txt /home/alice/         <span class="cc"># move to different location</span>
mv *.jpg /media/photos/            <span class="cc"># move all .jpg files</span>

<span class="cc"># rm — remove (PERMANENT — no Trash!)</span>
rm file.txt                        <span class="cc"># delete file</span>
rm -i file.txt                     <span class="cc"># ask before deleting (-i = interactive)</span>
rm -rf mydir/                      <span class="cc"># force-delete directory and all contents</span>
<span class="cc"># WARNING: rm -rf / is catastrophic. Always double-check paths!</span>`
    },
    {
      title:'Level 2 — Viewing File Contents',
      body:`<p>Reading files is one of the most frequent terminal tasks. Linux provides several tools, each suited to different situations:</p>`,
      code:`<span class="cc"># cat — concatenate and print (best for small files)</span>
cat /etc/hostname                  <span class="cc"># print entire file</span>
cat -n /etc/hosts                  <span class="cc"># print with line numbers</span>
cat file1.txt file2.txt > combined.txt  <span class="cc"># concatenate two files</span>

<span class="cc"># less — pager for large files (navigate up/down, search)</span>
less /var/log/syslog               <span class="cc"># open large file in interactive viewer</span>
<span class="cc"># less controls: j/k or arrows to scroll, /term to search, q to quit</span>

<span class="cc"># head / tail — view start or end of file</span>
head -20 /etc/passwd               <span class="cc"># first 20 lines</span>
tail -20 /var/log/auth.log         <span class="cc"># last 20 lines</span>
tail -f /var/log/syslog            <span class="cc"># -f follows: live stream of new lines</span>
tail -f /var/log/nginx/access.log  <span class="cc"># watch web server traffic in real time</span>

<span class="cc"># file — determine file type (not by extension)</span>
file /usr/bin/python3              <span class="cc"># ELF 64-bit LSB executable</span>
file /etc/nginx/nginx.conf         <span class="cc"># ASCII text</span>
file mystery.jpg                   <span class="cc"># JPEG image data</span>`
    },
    {
      title:'Level 3 — Finding Files: find, locate, which',
      body:`<p>The <span class="kw">find</span> command is one of the most powerful tools in Linux. It searches the filesystem in real time with extraordinary precision using expressions that can filter by name, type, size, time, permission, owner, and more — then execute actions on results.</p>`,
      code:`<span class="cc"># which — find the executable path of a command</span>
which python3                      <span class="cc"># Output: /usr/bin/python3</span>
which -a python                    <span class="cc"># -a shows ALL matching entries in PATH</span>

<span class="cc"># find — powerful real-time search</span>
find /home -name "*.txt"           <span class="cc"># find all .txt files under /home</span>
find /etc -name "*.conf" -type f   <span class="cc"># only regular files (not dirs)</span>
find / -name "lost*" 2>/dev/null   <span class="cc"># suppress "permission denied" errors</span>

<span class="cc"># find by size</span>
find /var -size +100M              <span class="cc"># files larger than 100 megabytes</span>
find /tmp -size -1k                <span class="cc"># files smaller than 1 kilobyte</span>

<span class="cc"># find by time</span>
find /etc -mtime -7                <span class="cc"># modified in last 7 days</span>
find /var/log -mtime +30           <span class="cc"># modified more than 30 days ago</span>

<span class="cc"># find by permissions / ownership</span>
find / -perm /4000 2>/dev/null     <span class="cc"># find setuid binaries (security audit)</span>
find /home -user alice             <span class="cc"># find all files owned by alice</span>

<span class="cc"># find + action: execute a command on each result</span>
find /tmp -name "*.log" -delete    <span class="cc"># find and delete all .log files in /tmp</span>
find /etc -name "*.conf" -exec wc -l {} \;   <span class="cc"># count lines in each conf file</span>
find . -name "*.py" -exec grep -l "import os" {} \;  <span class="cc"># find Python files using os</span>`
    },
    {
      title:'Real-World Usage on Your System',
      body:`<p>Here is how these commands translate to real tasks you will perform as a Linux user:</p>`,
      chips:[
        {label:'See disk usage',val:'du -sh /var/log/* | sort -h — find which log directories take the most space. -s=summary, -h=human-readable.'},
        {label:'Clean old logs',val:'find /var/log -name "*.gz" -mtime +30 -delete — delete compressed logs older than 30 days.'},
        {label:'Find config files',val:'find /etc -name "*.conf" -newer /etc/hostname — find config files changed more recently than a reference file.'},
        {label:'Bulk rename',val:'for f in *.jpeg; do mv "$f" "\${f%.jpeg}.jpg"; done — rename all .jpeg to .jpg using find + rename patterns.'},
        {label:'Watch live logs',val:'tail -f /var/log/syslog — essential for debugging: watch system events in real time as they happen.'},
        {label:'Confirm before delete',val:'find /tmp -name "cache_*" — always run find first without -delete to preview what you\'ll remove. Safety first.'}
      ]
    }
  ],
  quiz:[
    {q:'You are in /home/alice/projects. What does "cd ../../../etc" do?',opts:['Goes to /etc (up 3 levels from /home/alice/projects to /, then into /etc)','Goes to /home/alice/etc','Throws an error — too many ../','Goes to /home/etc'],ans:0,hint:'Count the ../: one gets you to /home/alice, two gets you to /home, three gets you to /. Then /etc goes into that directory. Follow the path step by step.'},
    {q:'Which ls command shows hidden files (dotfiles) with full details including size in KB/MB?',opts:['ls -l','ls -la','ls -lah','ls -hidden'],ans:2,hint:'You need three flags combined: long format (l), all including hidden (a), and human-readable sizes (h). In Linux you can combine single-letter flags.'},
    {q:'What is the critical difference between "cp file.txt /tmp/" and "mv file.txt /tmp/"?',opts:['cp is faster than mv','cp leaves the original file in place; mv removes it from the source location','mv keeps a backup; cp does not','There is no difference — both produce identical results'],ans:1,hint:'One command is a copy (two copies exist after), the other is a move (only one copy exists after, at the destination). This is fundamental.'},
    {q:'You want to find all files in /var that are larger than 500MB. Which command is correct?',opts:['ls -lS /var | grep 500','find /var -size +500M','du -h /var | sort -rh','stat /var --size +500M'],ans:1,hint:'The find command uses -size with a + prefix for "greater than". Units: c=bytes, k=kilobytes, M=megabytes, G=gigabytes.'},
    {q:'What does "tail -f /var/log/syslog" do, and when would you use it?',opts:['Reads the last 5 lines and exits immediately','Deletes the last 5 lines from the log','Follows the file, streaming new lines as they are written — used for real-time log monitoring','Tails recursively through all files in /var/log'],ans:2,hint:'The -f flag stands for "follow". It is the standard way to watch a live log. Press Ctrl+C to stop following.'}
  ]
},

// ─── PART 2: TEXT PROCESSING & I/O REDIRECTION ───────────────────
{
  id:'text-io', num:'02',
  title:'Text Processing & I/O Redirection',
  subtitle:'Grep, sed, cut, sort, pipes, and redirection — the language of text transformation that makes Linux shell pipelines the most powerful data processing tool available.',
  sections:[
    {
      title:'Standard Streams — stdin, stdout, stderr',
      body:`<p>Every Linux process works with three standard data streams. Understanding these is the foundation for all I/O redirection:</p>
<div class="diagram">
  <div class="diagram-title">Three Standard Streams</div>
  <div class="stack-item stack-active">📥 stdin (fd 0) — Standard Input: keyboard input or data piped from another command</div>
  <div class="stack-arrow">→ process reads from stdin</div>
  <div class="stack-item stack-active">📤 stdout (fd 1) — Standard Output: normal output written to terminal by default</div>
  <div class="stack-item stack-active">⚠️ stderr (fd 2) — Standard Error: error messages written to terminal (separate from stdout)</div>
</div>
<p>Keeping stdout and stderr separate is by design — it means you can pipe a command's normal output to the next command <em>without</em> mixing in error messages. You can redirect each stream independently.</p>`,
      code:`<span class="cc"># Redirect stdout to a file (overwrites)</span>
ls -la > filelist.txt

<span class="cc"># Redirect stdout (append — does not overwrite)</span>
echo "new line" >> filelist.txt

<span class="cc"># Redirect stderr to a file</span>
find / -name "*.conf" 2> errors.txt

<span class="cc"># Redirect both stdout AND stderr to same file</span>
find / -name "*.conf" > results.txt 2>&1
find / -name "*.conf" &> results.txt    <span class="cc"># shorthand</span>

<span class="cc"># Discard output (send to /dev/null — the black hole)</span>
find / -name "*.conf" 2>/dev/null       <span class="cc"># suppress errors</span>
command > /dev/null 2>&1               <span class="cc"># suppress all output</span>

<span class="cc"># Redirect a file as stdin input to a command</span>
sort < unsorted.txt                    <span class="cc"># sort reads from file instead of keyboard</span>
wc -l < /etc/passwd                   <span class="cc"># count lines in a file</span>`
    },
    {
      title:'Level 1 — The Pipe: Linux\'s Superpower',
      body:`<p>The pipe <span class="kw">|</span> (vertical bar) is the single most important operator in shell. It connects the <strong>stdout of one command</strong> to the <strong>stdin of the next command</strong>. This allows you to chain simple commands into powerful data processing pipelines — each tool does one job, pipes connect them.</p>`,
      code:`<span class="cc"># Basic pipe: output of ls becomes input of grep</span>
ls /etc | grep "nginx"              <span class="cc"># find nginx-related files in /etc</span>

<span class="cc"># Chain multiple pipes</span>
cat /etc/passwd | grep "bash" | cut -d: -f1   <span class="cc"># users with bash shell</span>

<span class="cc"># Count lines: how many processes are running?</span>
ps aux | wc -l

<span class="cc"># Sort disk usage and show top 10 largest items</span>
du -sh /var/log/* | sort -rh | head -10

<span class="cc"># Count how many times each error appears in a log</span>
grep "ERROR" /var/log/syslog | cut -d' ' -f5 | sort | uniq -c | sort -rn

<span class="cc"># See what package installs are running right now</span>
ps aux | grep apt | grep -v grep

<span class="cc"># Pipeline logic: find large files, sort, preview top 5</span>
find /var -size +50M -type f 2>/dev/null | xargs du -sh | sort -rh | head -5`
    },
    {
      title:'Level 2 — grep: Searching Text',
      body:`<p><span class="kw">grep</span> (Global Regular Expression Print) searches for a pattern in text and prints matching lines. It is the most frequently used text-processing command in Linux and essential for log analysis, config searching, and scripting.</p>`,
      code:`<span class="cc"># Basic grep</span>
grep "error" /var/log/syslog           <span class="cc"># find lines containing "error"</span>
grep -i "error" /var/log/syslog        <span class="cc"># -i: case-insensitive</span>
grep -n "error" /var/log/syslog        <span class="cc"># -n: show line numbers</span>
grep -c "error" /var/log/syslog        <span class="cc"># -c: count matching lines only</span>
grep -v "error" /var/log/syslog        <span class="cc"># -v: invert — show NON-matching lines</span>

<span class="cc"># Recursive search through directories</span>
grep -r "password" /etc/               <span class="cc"># search all files in /etc</span>
grep -rl "secret" /home/              <span class="cc"># -l: only print filenames (not lines)</span>

<span class="cc"># Context around matches</span>
grep -A3 "FAILED" /var/log/auth.log   <span class="cc"># 3 lines After match</span>
grep -B2 "FAILED" /var/log/auth.log   <span class="cc"># 2 lines Before match</span>
grep -C2 "FAILED" /var/log/auth.log   <span class="cc"># 2 lines Context (before and after)</span>

<span class="cc"># Extended regex (-E) for more powerful patterns</span>
grep -E "error|warning|critical" /var/log/syslog    <span class="cc"># OR pattern</span>
grep -E "^[0-9]" /etc/hosts            <span class="cc"># lines starting with a digit</span>
grep -E "\b192\.168\." /etc/hosts      <span class="cc"># match IP prefix</span>

<span class="cc"># Practical: find failed SSH login attempts</span>
grep "Failed password" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -rn`
    },
    {
      title:'Level 2 — cut, sort, uniq, wc, tr',
      body:`<p>These five commands are the essential "data plumbing" tools. You will use them constantly inside pipelines to extract, sort, deduplicate, count, and transform text.</p>`,
      code:`<span class="cc"># cut — extract specific fields/columns</span>
cut -d: -f1 /etc/passwd               <span class="cc"># -d: delimiter, -f1: first field → usernames</span>
cut -d: -f1,3 /etc/passwd             <span class="cc"># first and third fields (username, uid)</span>
cut -c1-10 /etc/hostname              <span class="cc"># characters 1 through 10</span>
echo "2024-01-15" | cut -d- -f2       <span class="cc"># extract month from date string → "01"</span>

<span class="cc"># sort — sort lines of text</span>
sort /etc/passwd                       <span class="cc"># alphabetical sort</span>
sort -r /etc/passwd                    <span class="cc"># reverse sort</span>
sort -n numbers.txt                    <span class="cc"># numeric sort</span>
sort -k3 -n /etc/passwd               <span class="cc"># sort by 3rd field numerically (UID)</span>
sort -t: -k3 -n /etc/passwd           <span class="cc"># with custom delimiter (:)</span>
du -sh * | sort -h                     <span class="cc"># sort by human-readable size</span>

<span class="cc"># uniq — remove (or count) duplicate adjacent lines</span>
sort /etc/group | uniq                 <span class="cc"># always sort before uniq!</span>
sort file.txt | uniq -c               <span class="cc"># -c: prefix each line with count</span>
sort file.txt | uniq -d               <span class="cc"># -d: print only duplicated lines</span>
sort file.txt | uniq -u               <span class="cc"># -u: print only unique (non-duplicated) lines</span>

<span class="cc"># wc — word count (lines, words, bytes)</span>
wc -l /etc/passwd                     <span class="cc"># count lines</span>
wc -w document.txt                    <span class="cc"># count words</span>
ls /etc/ | wc -l                      <span class="cc"># how many files in /etc?</span>

<span class="cc"># tr — translate or delete characters</span>
echo "hello world" | tr 'a-z' 'A-Z'  <span class="cc"># lowercase to uppercase</span>
echo "a:b:c:d" | tr ':' '\n'         <span class="cc"># replace colons with newlines</span>
cat file.txt | tr -d '\r'            <span class="cc"># remove Windows carriage returns</span>`
    },
    {
      title:'Level 3 — sed: Stream Editor',
      body:`<p><span class="kw">sed</span> (Stream EDitor) processes text line by line, applying editing commands. It is primarily used for find-and-replace, line deletion, and text transformation in pipelines and scripts. You do not need to open a file in an editor — sed transforms it in one command.</p>`,
      code:`<span class="cc"># sed substitution: s/find/replace/flags</span>
sed 's/http/https/' urls.txt          <span class="cc"># replace first occurrence per line</span>
sed 's/http/https/g' urls.txt         <span class="cc"># g flag: replace ALL occurrences per line</span>
sed 's/http/https/gi' urls.txt        <span class="cc"># gi: global + case-insensitive</span>

<span class="cc"># -i: edit file in-place (MODIFIES THE ACTUAL FILE)</span>
sed -i 's/localhost/127.0.0.1/g' app.conf   <span class="cc"># real system config edit</span>
sed -i.bak 's/old/new/g' file.txt          <span class="cc"># make .bak backup before editing</span>

<span class="cc"># Delete lines</span>
sed '/^#/d' /etc/fstab                <span class="cc"># delete comment lines (starting with #)</span>
sed '/^$/d' file.txt                  <span class="cc"># delete empty lines</span>
sed '5d' file.txt                     <span class="cc"># delete line 5</span>
sed '5,10d' file.txt                  <span class="cc"># delete lines 5 through 10</span>

<span class="cc"># Print specific lines</span>
sed -n '10,20p' /var/log/syslog       <span class="cc"># print lines 10-20 only</span>

<span class="cc"># Practical: update server IP in all config files</span>
grep -rl "192.168.1.10" /etc/app/ | xargs sed -i 's/192.168.1.10/10.0.0.5/g'`
    },
    {
      title:'Level 3 — Command Chaining & Shell Operators',
      body:`<p>Beyond pipes, the shell gives you operators to control command flow based on success or failure. These are fundamental to safe scripting and command-line workflows.</p>`,
      chips:[
        {label:'; — always run both',val:'cmd1 ; cmd2 — Run cmd2 regardless of cmd1 result. Like two separate commands on one line. Example: mkdir dir; cd dir'},
        {label:'&& — run if success',val:'cmd1 && cmd2 — Run cmd2 ONLY if cmd1 succeeded (exit code 0). Example: mkdir /backup && cp data.tar /backup/'},
        {label:'|| — run if failure',val:'cmd1 || cmd2 — Run cmd2 ONLY if cmd1 failed. Example: ping -c1 server || echo "Server unreachable"'},
        {label:'! — negate exit code',val:'! command — Inverts the exit code. Used in if statements: if ! grep -q "user" /etc/passwd; then ...'},
        {label:'$() — command substitution',val:'var=$(command) — Capture output of command into variable. Example: today=$(date +%Y-%m-%d)'},
        {label:'tee — split stream',val:'cmd | tee file.txt — Sends stdout to both the screen AND a file simultaneously. Useful for logging pipeline output.'}
      ]
    }
  ],
  quiz:[
    {q:'What does "grep -v" do?',opts:['Print only the first matching line','Print lines that do NOT match the pattern (invert match)','Verbose mode — show extra details about matches','Enable version-specific grep syntax'],ans:1,hint:'-v stands for "invert". Instead of printing lines that match, it prints every line that does NOT match. Very useful for filtering out noise.'},
    {q:'You want to find all usernames (field 1) from /etc/passwd where the shell is bash. Which pipeline is correct?',opts:['ls /etc/passwd | grep bash','grep "bash" /etc/passwd | cut -d: -f1','cut /etc/passwd -bash | grep 1','find /etc -name passwd | wc -l'],ans:1,hint:'First filter for lines containing bash (grep), then extract the first colon-delimited field (cut -d: -f1). This is a classic two-stage pipeline.'},
    {q:'What is the difference between ">" and ">>" for output redirection?',opts:['> appends to a file; >> overwrites it','> overwrites the file (truncates first); >> appends to the end without overwriting','They are identical — both create the file if it does not exist','>> is for stderr; > is for stdout'],ans:1,hint:'> is destructive if the file exists — it starts fresh. >> is additive — it always adds to the end. For logs and backups, >> is usually safer.'},
    {q:'A command outputs data to both stdout and stderr. How do you capture BOTH into one file?',opts:['command > file.txt + stderr.txt','command 2>&1 > file.txt','command > file.txt 2>&1','command &stdout > file.txt'],ans:2,hint:'Order matters! You redirect stdout first (> file.txt), then redirect stderr (2>) to go to the same place as stdout (&1). The & before 1 means "same destination as fd 1".'},
    {q:'You want to replace all occurrences of "production" with "staging" IN the file config.yml (not just print output). Which sed command does this?',opts:['sed "s/production/staging/g" config.yml','sed -i "s/production/staging/g" config.yml','sed -n "s/production/staging/g" config.yml','sed -p "s/production/staging/g" config.yml'],ans:1,hint:'Without -i, sed only prints the result — the file is unchanged. The -i flag means "in-place": actually modify the file on disk.'}
  ]
},

// ─── PART 3: PROCESS & SYSTEM MONITORING ─────────────────────────
{
  id:'proc-monitor', num:'03',
  title:'Process & System Monitoring',
  subtitle:'See exactly what\'s running, how much CPU and memory it consumes, control jobs in the foreground and background, and send signals to processes with precision.',
  sections:[
    {
      title:'What Is a Process? PIDs, PPIDs, and the Process Tree',
      body:`<p>A <span class="kw">process</span> is a running instance of a program. Every process on Linux has:</p>
<ul>
<li><strong>PID</strong> — Process ID: a unique number assigned by the kernel</li>
<li><strong>PPID</strong> — Parent Process ID: the PID of the process that spawned it</li>
<li><strong>UID/GID</strong> — User/Group ID: which user owns this process (sets its permissions)</li>
<li><strong>State</strong> — R (running), S (sleeping), D (uninterruptible I/O wait), Z (zombie), T (stopped)</li>
<li><strong>CPU/Memory</strong> — Resources consumed since the process started</li>
</ul>
<p>All processes form a tree rooted at <span class="kw">systemd (PID 1)</span>. Every process was started by another process. When a parent exits, orphaned children are re-parented to systemd.</p>`,
      code:`<span class="cc"># See the complete process tree</span>
pstree -p                          <span class="cc"># tree view with PIDs</span>
pstree -u                          <span class="cc"># show user name per process</span>

<span class="cc"># Find a process ID by name</span>
pgrep firefox                      <span class="cc"># print PIDs of processes named firefox</span>
pgrep -l python                    <span class="cc"># -l: print PID and name</span>
pgrep -u alice                     <span class="cc"># all processes owned by alice</span>

<span class="cc"># See parent-child relationship</span>
ps -f -p $(pgrep bash)             <span class="cc"># full format for bash processes</span>`
    },
    {
      title:'Level 1 — ps: Taking a Snapshot',
      body:`<p><span class="kw">ps</span> (process status) shows a snapshot of currently running processes. Different option styles give different views — the BSD-style <code>ps aux</code> is the most widely used combination:</p>`,
      code:`<span class="cc"># The most used ps command — full system process list</span>
ps aux
<span class="cc"># Columns: USER PID %CPU %MEM VSZ RSS TTY STAT START TIME COMMAND</span>
<span class="cc"># VSZ = virtual memory size, RSS = actual RAM used</span>

<span class="cc"># ps with Unix-style flags</span>
ps -ef                             <span class="cc"># full format: shows PPID (parent PID)</span>
ps -u alice                        <span class="cc"># all processes owned by alice</span>
ps -C nginx                        <span class="cc"># processes by name</span>

<span class="cc"># Combine ps with grep (common pattern)</span>
ps aux | grep nginx                <span class="cc"># find nginx process</span>
ps aux | grep -v grep | grep nginx <span class="cc"># exclude the grep process from results</span>

<span class="cc"># Sort by CPU or memory usage</span>
ps aux --sort=-%cpu | head -10     <span class="cc"># top 10 CPU consumers</span>
ps aux --sort=-%mem | head -10     <span class="cc"># top 10 memory consumers</span>

<span class="cc"># Custom output columns</span>
ps -eo pid,ppid,user,stat,cmd      <span class="cc"># select exactly what to show</span>
ps -eo pid,%cpu,%mem,comm --sort=-%cpu | head -15`
    },
    {
      title:'Level 2 — top and htop: Live Monitoring',
      body:`<p><span class="kw">top</span> is the classic real-time process monitor, built into every Linux system. <span class="kw">htop</span> is its modern, interactive replacement (install with <code>apt install htop</code>).</p>`,
      code:`<span class="cc"># top — built-in real-time process monitor</span>
top
<span class="cc"># Keyboard shortcuts inside top:</span>
<span class="cc">#   q = quit           k = kill a process (prompts for PID)</span>
<span class="cc">#   M = sort by Memory  P = sort by CPU (default)</span>
<span class="cc">#   1 = show all CPU cores individually</span>
<span class="cc">#   u = filter by user   f = add/remove columns</span>
<span class="cc">#   d = change update interval (default: 3 seconds)</span>

<span class="cc"># Run top non-interactively (for scripting)</span>
top -bn1                           <span class="cc"># -b=batch mode, -n1=one iteration</span>
top -bn1 | grep "Cpu(s)"          <span class="cc"># extract CPU line</span>

<span class="cc"># htop — modern, color-coded, mouse-enabled</span>
htop
<span class="cc"># htop features:</span>
<span class="cc">#   F3 = search for process name</span>
<span class="cc">#   F5 = toggle tree view (see parent/child hierarchy)</span>
<span class="cc">#   F9 = send signal to selected process</span>
<span class="cc">#   F6 = sort by any column</span>

<span class="cc"># System resource overview (no per-process detail)</span>
free -h                            <span class="cc"># memory usage (RAM + swap)</span>
uptime                             <span class="cc"># load average over 1, 5, 15 minutes</span>
vmstat 1 5                         <span class="cc"># virtual memory stats: 5 updates, 1s interval</span>
iostat -x 1 3                     <span class="cc"># disk I/O statistics</span>`
    },
    {
      title:'Level 2 — Job Control: fg, bg, &, Ctrl+Z',
      body:`<p>The shell lets you run and manage multiple jobs (commands) in a single terminal session using <strong>job control</strong>. This is essential when you need to run long commands without blocking your terminal.</p>`,
      code:`<span class="cc"># Run a command in the BACKGROUND (append &)</span>
long-running-script.sh &           <span class="cc"># starts, prints [1] PID, returns to prompt</span>
sleep 100 &                        <span class="cc"># background sleep job</span>

<span class="cc"># Ctrl+Z — SUSPEND the foreground job (pause, not kill)</span>
<span class="cc"># (press Ctrl+Z while a command is running)</span>
<span class="cc"># Output: [1]+  Stopped    top</span>

<span class="cc"># jobs — list all current shell jobs</span>
jobs                               <span class="cc"># shows job numbers, status, command</span>
jobs -l                            <span class="cc"># also shows PIDs</span>
<span class="cc"># [1]+  Running    sleep 100 &</span>
<span class="cc"># [2]+  Stopped    top</span>

<span class="cc"># bg — resume a stopped job in the background</span>
bg %2                              <span class="cc"># resume job number 2 in background</span>
bg                                 <span class="cc"># resume most recently stopped job</span>

<span class="cc"># fg — bring a background/stopped job to foreground</span>
fg %1                              <span class="cc"># bring job 1 to foreground</span>
fg                                 <span class="cc"># bring most recent job to foreground</span>

<span class="cc"># disown — detach job from shell (survives shell exit)</span>
sleep 1000 &
disown %1                          <span class="cc"># job continues even if you close the terminal</span>

<span class="cc"># nohup — run command immune to hangup signal</span>
nohup ./long_backup.sh &           <span class="cc"># keeps running after logout</span>`
    },
    {
      title:'Level 3 — kill, killall, pkill: Sending Signals',
      body:`<p>When a process misbehaves — consuming too much CPU, frozen, or leaking memory — you send it a <span class="kw">signal</span>. The kernel delivers the signal to the process, which can handle it or (for SIGKILL) is force-terminated.</p>`,
      code:`<span class="cc"># kill — send a signal to a process by PID</span>
kill 1234                          <span class="cc"># default: sends SIGTERM (15) — polite request to stop</span>
kill -9 1234                       <span class="cc"># send SIGKILL — force terminate (cannot be caught!)</span>
kill -15 1234                      <span class="cc"># explicit SIGTERM</span>
kill -HUP 1234                     <span class="cc"># SIGHUP — reload config (nginx, sshd, etc.)</span>
kill -STOP 1234                    <span class="cc"># pause process (like Ctrl+Z but for any process)</span>
kill -CONT 1234                    <span class="cc"># resume a paused process</span>

<span class="cc"># killall — send signal by process NAME</span>
killall firefox                    <span class="cc"># kill all processes named firefox (SIGTERM)</span>
killall -9 chrome                  <span class="cc"># force kill all chrome processes</span>
killall -HUP nginx                 <span class="cc"># reload nginx config without downtime</span>

<span class="cc"># pkill — kill by pattern match (more flexible than killall)</span>
pkill python                       <span class="cc"># kill all python processes</span>
pkill -u alice                     <span class="cc"># kill all processes owned by alice</span>
pkill -9 -f "my_script.py"        <span class="cc"># match full command line, not just name</span>

<span class="cc"># nice / renice — adjust process CPU priority</span>
nice -n 10 ./heavy_job.sh          <span class="cc"># start with lower priority (0=default, 19=lowest)</span>
renice -n 5 -p 1234               <span class="cc"># change priority of running process</span>
sudo renice -n -10 -p 1234        <span class="cc"># increase priority (requires root)</span>`
    },
    {
      title:'Real-World Monitoring Scenarios',
      body:`<p>Here is how these monitoring commands come together in real situations you will encounter:</p>`,
      chips:[
        {label:'Server is slow — find culprit',val:'top then press M (sort by memory) or P (sort by CPU). Or: ps aux --sort=-%cpu | head -5 for a quick non-interactive snapshot.'},
        {label:'Process not responding',val:'First try: kill PID (sends SIGTERM). Wait 5 seconds. If still running: kill -9 PID. Never start with -9 — give the process a chance to clean up.'},
        {label:'Long task in terminal',val:'Start command, Ctrl+Z to pause, bg %1 to push to background. Or start with & from the beginning. Use jobs to see all background tasks.'},
        {label:'Watch memory over time',val:'watch -n 2 free -h — refreshes free every 2 seconds. Or: vmstat 2 for continuous updates with CPU, memory, and I/O in one view.'},
        {label:'Find what opened a file/port',val:'lsof -p PID — list all files/sockets opened by that process. lsof -i :80 — find process using port 80.'},
        {label:'Reload service without restart',val:'sudo kill -HUP $(pgrep nginx) OR sudo systemctl reload nginx — sends SIGHUP to reload the config file with zero downtime.'}
      ]
    }
  ],
  quiz:[
    {q:'What does "ps aux" show vs "ps -ef"?',opts:['They are identical in every way','ps aux uses BSD style and shows %CPU/%MEM columns; ps -ef uses Unix style and shows PPID (parent PID)','ps aux only shows your own processes; ps -ef shows all users','ps aux is interactive like top; ps -ef is a static snapshot'],ans:1,hint:'Both show all processes, but in different formats. The key unique thing ps -ef shows that ps aux doesn\'t is the PPID column — the parent process ID.'},
    {q:'You press Ctrl+Z while running a command. What happens?',opts:['The command is permanently killed','The command is suspended (paused) and pushed to a stopped background job — you can resume it with fg or bg','The command runs faster in the background','The command output is saved to a file'],ans:1,hint:'Ctrl+Z sends SIGSTOP to the process, which pauses it. The shell shows it as a "Stopped" job. It still exists in memory — just not executing. fg brings it back to the foreground.'},
    {q:'What is the correct order to try killing an unresponsive process?',opts:['Always start with kill -9 PID for reliability','First kill -15 (SIGTERM) to allow graceful shutdown, then kill -9 (SIGKILL) only if needed','Use killall first, then ps aux','Always use pkill — it is safer than kill'],ans:1,hint:'SIGTERM (15) is a polite request — the process can save data and clean up. SIGKILL (9) is immediate and forced, leaving no chance for cleanup. Always try SIGTERM first.'},
    {q:'What does "nice -n 19 ./build.sh &" accomplish?',opts:['Runs build.sh with the highest CPU priority','Runs build.sh in the background with the lowest possible CPU priority (nicest to other processes)','Sends 19 signals to build.sh','Runs build.sh 19 times in parallel'],ans:1,hint:'nice values range from -20 (highest priority) to 19 (lowest priority). A "nice" process yields CPU to others. 19 means "only use CPU when nobody else needs it."'},
    {q:'Which command would find the PID of ALL running Python processes AND their names?',opts:['ps python','pgrep -l python','pidof python --verbose','find /proc -name python'],ans:1,hint:'pgrep searches for processes by name. The -l flag adds the process name next to each PID. Without -l you just get bare PIDs.'}
  ]
},

// ─── PART 4: PERMISSIONS, USERS & ARCHIVES ───────────────────────
{
  id:'perms-arch', num:'04',
  title:'Permissions, Users & Archives',
  subtitle:'Master Linux\'s permission model — rwx bits, octal notation, ownership, sudo privileges — then learn to pack and unpack archives with tar, gzip, and zip.',
  sections:[
    {
      title:'The Permission Model: Users, Groups, Others',
      body:`<p>Every file and directory in Linux has an <strong>owner user</strong>, an <strong>owner group</strong>, and a set of <strong>permission bits</strong>. The kernel checks these bits every time a process tries to read, write, or execute a file.</p>
<p>When you run <code>ls -l</code>, the first column shows the 10-character permission string:</p>
<div class="diagram">
  <div class="diagram-title">Decoding a Permission String</div>
  <div class="stack-item stack-active">-  rwx  r-x  r-- &nbsp; alice &nbsp; staff &nbsp; notes.sh</div>
  <div class="stack-arrow">│  │    │    └── Others (everyone else): read only</div>
  <div class="stack-arrow">│  │    └──────── Group (staff): read + execute</div>
  <div class="stack-arrow">│  └───────────── Owner (alice): read + write + execute</div>
  <div class="stack-arrow">└──────────────── File type: - = file, d = directory, l = symlink</div>
</div>
<p>The three permission bits for each category: <span class="kw">r</span> = read (4), <span class="kw">w</span> = write (2), <span class="kw">x</span> = execute (1). The <strong>octal value</strong> is the sum: rwx = 4+2+1 = <strong>7</strong>, r-x = 4+0+1 = <strong>5</strong>, r-- = 4+0+0 = <strong>4</strong>.</p>`
    },
    {
      title:'Level 1 — chmod: Changing Permissions',
      body:`<p><span class="kw">chmod</span> (change mode) sets file permissions. It accepts two forms: symbolic (human-readable) or octal (numeric).</p>`,
      code:`<span class="cc"># Symbolic form: [who][+/-/=][permissions]</span>
chmod u+x script.sh        <span class="cc"># u=user/owner: add execute permission</span>
chmod g-w file.txt         <span class="cc"># g=group: remove write permission</span>
chmod o-r secrets.txt      <span class="cc"># o=others: remove read permission</span>
chmod a+r public.txt       <span class="cc"># a=all: add read for everyone</span>
chmod u=rw,g=r,o= file.txt <span class="cc"># set exact permissions with =</span>

<span class="cc"># Octal form: owner group others (each 0-7)</span>
chmod 755 script.sh        <span class="cc"># rwxr-xr-x (standard executable)</span>
chmod 644 config.txt       <span class="cc"># rw-r--r-- (standard read-only config)</span>
chmod 600 ~/.ssh/id_rsa    <span class="cc"># rw------- (SSH key: only owner can read/write!)</span>
chmod 700 private_dir/     <span class="cc"># rwx------ (directory: owner only)</span>
chmod 777 shared/          <span class="cc"># rwxrwxrwx (everyone full access — use with caution!)</span>

<span class="cc"># -R flag: apply recursively to directories</span>
chmod -R 755 /var/www/html/   <span class="cc"># web server files</span>
chmod -R u+rw ~/projects/     <span class="cc"># ensure you have read+write on all your files</span>

<span class="cc"># Special bits</span>
chmod u+s /usr/bin/passwd  <span class="cc"># setuid: runs as owner's UID (not caller's)</span>
chmod +t /tmp              <span class="cc"># sticky bit: only owner can delete their own files</span>`
    },
    {
      title:'Level 1 — chown and chgrp: Changing Ownership',
      body:`<p><span class="kw">chown</span> changes who owns a file. Only root can give a file to another user. Regular users can only change group ownership to groups they belong to.</p>`,
      code:`<span class="cc"># chown user file — change owner</span>
sudo chown alice report.txt         <span class="cc"># change owner to alice</span>
sudo chown alice:staff report.txt   <span class="cc"># change owner AND group in one command</span>
sudo chown :developers app.conf     <span class="cc"># change group only (note the colon before name)</span>
sudo chown -R www-data /var/www/    <span class="cc"># recursive: change all files under /var/www/</span>

<span class="cc"># chgrp — change group ownership</span>
chgrp developers project.py        <span class="cc"># change group to developers</span>
chgrp -R staff /home/shared/       <span class="cc"># recursive group change</span>

<span class="cc"># Practical: fix web server permissions</span>
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
sudo chmod -R 644 /var/www/html/*.html

<span class="cc"># View ownership and permissions together</span>
ls -la /etc/shadow                 <span class="cc"># ---------- 1 root shadow — no permissions at all!</span>
stat /etc/passwd                   <span class="cc"># detailed file metadata including all timestamps</span>`
    },
    {
      title:'Level 2 — sudo, su, and User Management',
      body:`<p><span class="kw">sudo</span> (superuser do) allows an authorized user to run a command as root (or another user) without knowing the root password. The authorization is configured in <code>/etc/sudoers</code>. This is the modern standard — root logins are typically disabled on most Linux systems.</p>`,
      code:`<span class="cc"># sudo — run a command as root</span>
sudo apt update                    <span class="cc"># run as root</span>
sudo -u bob ls /home/bob/         <span class="cc"># run as specific user bob</span>
sudo -i                            <span class="cc"># open interactive root shell (loads root env)</span>
sudo -s                            <span class="cc"># root shell keeping your environment</span>
sudo -l                            <span class="cc"># list what sudo commands YOU are allowed to run</span>

<span class="cc"># su — switch user (requires target user's password)</span>
su alice                           <span class="cc"># switch to alice (prompts for alice's password)</span>
su - alice                         <span class="cc"># full login shell: load alice's full environment</span>
su -                               <span class="cc"># switch to root (prompts for root password)</span>

<span class="cc"># User and group information</span>
whoami                             <span class="cc"># print your current username</span>
id                                 <span class="cc"># uid, gid, and all group memberships</span>
id alice                           <span class="cc"># information for another user</span>
groups                             <span class="cc"># list groups you belong to</span>

<span class="cc"># User management (requires root)</span>
sudo useradd -m -s /bin/bash bob   <span class="cc"># create user bob with home dir and bash shell</span>
sudo passwd bob                    <span class="cc"># set/change bob's password</span>
sudo usermod -aG sudo bob          <span class="cc"># add bob to sudo group (gives sudo access)</span>
sudo userdel -r bob                <span class="cc"># delete user bob and their home directory</span>

<span class="cc"># Safe way to edit sudoers (validates syntax before saving)</span>
sudo visudo`
    },
    {
      title:'Level 2 — Archives with tar, gzip, and zip',
      body:`<p>Linux uses <span class="kw">tar</span> to bundle files into an archive, and <span class="kw">gzip</span> / <span class="kw">bzip2</span> / <span class="kw">xz</span> to compress them. Combined as <code>.tar.gz</code> (or <code>.tgz</code>), this is the standard format for Linux software distributions and backups.</p>`,
      code:`<span class="cc"># tar — the most important flags to memorize:</span>
<span class="cc"># c = Create, x = eXtract, v = Verbose, f = File, z = gzip, j = bzip2</span>

<span class="cc"># CREATE archives</span>
tar -czf backup.tar.gz /home/alice/      <span class="cc"># create compressed .tar.gz archive</span>
tar -cjf backup.tar.bz2 /home/alice/    <span class="cc"># create .tar.bz2 (better compression)</span>
tar -czf logs.tar.gz /var/log/*.log     <span class="cc"># archive specific files</span>

<span class="cc"># EXTRACT archives</span>
tar -xzf backup.tar.gz                  <span class="cc"># extract .tar.gz into current directory</span>
tar -xzf backup.tar.gz -C /restore/    <span class="cc"># extract into specific directory</span>
tar -xzf archive.tar.gz file.txt       <span class="cc"># extract single file from archive</span>

<span class="cc"># LIST contents without extracting</span>
tar -tzf backup.tar.gz                 <span class="cc"># list files in a .tar.gz</span>
tar -tvzf backup.tar.gz                <span class="cc"># verbose list with permissions/dates</span>

<span class="cc"># gzip / gunzip — compress single files</span>
gzip large_file.log                    <span class="cc"># creates large_file.log.gz (removes original)</span>
gzip -k large_file.log                 <span class="cc"># -k: keep original file</span>
gunzip large_file.log.gz               <span class="cc"># decompress</span>
zcat large_file.log.gz                 <span class="cc"># read .gz file without decompressing it</span>

<span class="cc"># zip / unzip — cross-platform format (Windows compatible)</span>
zip -r project.zip /home/alice/project/
unzip project.zip -d /destination/`
    }
  ],
  quiz:[
    {q:'A file has permissions "rw-r-----". What is the correct octal notation?',opts:['644','640','600','642'],ans:1,hint:'Break into 3 groups: rw- = 4+2+0 = 6, r-- = 4+0+0 = 4, --- = 0+0+0 = 0. So the octal is 640.'},
    {q:'What does "chmod 600 ~/.ssh/id_rsa" enforce?',opts:['Anyone can read the SSH key','Only the owner can read and write; no one else has any access','Everyone can read but only the owner can write','The file becomes executable by all users'],ans:1,hint:'6 = rw- (owner: read+write), 0 = --- (group: none), 0 = --- (others: none). SSH refuses to use a key file with too-open permissions.'},
    {q:'You want to change the owner AND group of /var/www recursively to www-data. Which command is correct?',opts:['chown www-data /var/www && chgrp www-data /var/www','sudo chown -R www-data:www-data /var/www','sudo chmod www-data:www-data /var/www','sudo usermod www-data /var/www'],ans:1,hint:'chown accepts user:group in one argument. Adding -R makes it recursive. sudo is needed because /var/www is owned by root.'},
    {q:'What is the correct tar command to CREATE a compressed .tar.gz backup of /etc?',opts:['tar -xzf etc-backup.tar.gz /etc','tar -czf etc-backup.tar.gz /etc','tar -tzf /etc > etc-backup.tar.gz','gzip /etc > etc-backup.tar.gz'],ans:1,hint:'c=Create, z=gzip compress, f=File. x=eXtract (the opposite). The archive name comes right after -f, then the source path.'},
    {q:'What does "sudo usermod -aG docker alice" do?',opts:['Creates a new user called docker in alice\'s group','Removes alice from the docker group','Adds alice to the docker group without removing her from other groups (-a = append)','Changes alice\'s primary group to docker'],ans:2,hint:'The -a flag is critical: it APPENDS to supplementary groups. Without -a, using -G alone would REPLACE all existing groups. Always use -aG together.'}
  ]
},

// ─── PART 5: NETWORKING & SHELL POWER ────────────────────────────
{
  id:'net-shell', num:'05',
  title:'Networking & Shell Power',
  subtitle:'Network diagnostics, SSH, package management, and shell productivity tools — bringing everything together into complete real-world command-line mastery.',
  sections:[
    {
      title:'Level 1 — Network Diagnostics',
      body:`<p>Understanding your network from the command line is essential for both daily use and system administration. These tools let you test connectivity, inspect DNS, examine ports, and transfer data.</p>`,
      code:`<span class="cc"># ping — test basic connectivity (ICMP echo requests)</span>
ping google.com                    <span class="cc"># continuous ping (Ctrl+C to stop)</span>
ping -c 4 8.8.8.8                  <span class="cc"># send exactly 4 packets then stop</span>

<span class="cc"># dig — DNS query tool (authoritative, detailed)</span>
dig google.com                     <span class="cc"># full DNS response for A record</span>
dig google.com MX                  <span class="cc"># query Mail Exchange records</span>
dig @8.8.8.8 google.com           <span class="cc"># query using Google's DNS directly</span>
dig +short google.com              <span class="cc"># just the IP address (clean output)</span>

<span class="cc"># ss — socket statistics (modern replacement for netstat)</span>
ss -tlnp                           <span class="cc"># TCP listening ports with process names</span>
ss -tunap                          <span class="cc"># all TCP+UDP connections</span>
ss -tlnp | grep :80                <span class="cc"># what process is on port 80?</span>

<span class="cc"># curl — transfer data from/to URLs</span>
curl https://api.ipify.org         <span class="cc"># get your public IP address</span>
curl -I https://example.com        <span class="cc"># headers only — see HTTP status code, server</span>
curl -o output.html https://example.com  <span class="cc"># save body to file</span>
curl -L https://example.com        <span class="cc"># follow redirects</span>
curl -X POST -H "Content-Type: application/json" -d '{"k":"v"}' https://api/

<span class="cc"># wget — download files (better than curl for large files)</span>
wget https://example.com/file.tar.gz     <span class="cc"># download to current directory</span>
wget -O custom-name.tar.gz https://url   <span class="cc"># save with custom filename</span>
wget -q --show-progress https://url      <span class="cc"># quiet with progress bar</span>`
    },
    {
      title:'Level 2 — SSH: Secure Remote Access',
      body:`<p><span class="kw">SSH</span> (Secure Shell) is the standard way to connect to remote Linux machines. It encrypts all traffic and supports both password and key-based authentication. Key-based auth is far more secure and is standard in production environments.</p>`,
      code:`<span class="cc"># Connect to a remote machine</span>
ssh alice@192.168.1.50             <span class="cc"># connect as alice</span>
ssh -p 2222 alice@server           <span class="cc"># custom port</span>

<span class="cc"># Generate and use SSH keys</span>
ssh-keygen -t ed25519 -C "alice@laptop"   <span class="cc"># create key pair</span>
ssh-copy-id alice@server                  <span class="cc"># install public key on server</span>

<span class="cc"># scp — secure file copy over SSH</span>
scp file.txt alice@server:/home/alice/    <span class="cc"># copy TO remote</span>
scp alice@server:/var/log/app.log ./      <span class="cc"># copy FROM remote</span>
scp -r ./project/ alice@server:/deploy/  <span class="cc"># copy directory (-r)</span>

<span class="cc"># Run a single command on remote without interactive shell</span>
ssh alice@server "df -h && free -h"       <span class="cc"># check disk + memory remotely</span>

<span class="cc"># ~/.ssh/config — save connection aliases</span>
<span class="cc"># Host webserver</span>
<span class="cc">#     HostName 192.168.1.50</span>
<span class="cc">#     User alice</span>
<span class="cc">#     Port 2222</span>
<span class="cc"># After saving: ssh webserver (uses all settings above)</span>`
    },
    {
      title:'Level 2 — Package Management',
      body:`<p>Package managers handle installing, updating, and removing software. Each Linux distribution family uses a different package manager, but the concepts are identical. <strong>Know your distro\'s package manager</strong> — it is the primary way to add software on Linux.</p>`,
      chips:[
        {label:'apt (Debian/Ubuntu)',val:'sudo apt update → sudo apt install nginx. apt upgrade for system updates. apt remove to uninstall. apt search for finding packages. apt show for details.'},
        {label:'dnf (Fedora/RHEL)',val:'sudo dnf install nginx. dnf update for upgrades. dnf remove to uninstall. dnf search. dnf info. Replaces older yum on modern systems.'},
        {label:'pacman (Arch Linux)',val:'-S install, -R remove, -Syu full system upgrade, -Ss search, -Qi package info. Arch uses rolling release — always up to date.'},
        {label:'snap (universal)',val:'sudo snap install code — Snap packages include all dependencies. Work across distros. snap list shows installed snaps. snap refresh to update.'},
        {label:'flatpak (universal)',val:'flatpak install flathub org.gimp.GIMP — sandboxed GUI apps. flatpak update for updates. Works on any distro with Flatpak installed.'},
        {label:'pip (Python)',val:'pip install requests — installs Python packages. pip install -r requirements.txt. pip list. Always use venv for projects: python3 -m venv .venv'}
      ]
    },
    {
      title:'Level 3 — Shell Variables, Aliases & Productivity',
      body:`<p>The shell is a programmable environment. Shell variables and aliases let you customize your workflow and dramatically speed up repetitive tasks.</p>`,
      code:`<span class="cc"># Shell variables</span>
name="Alice"                       <span class="cc"># assign (no spaces around =)</span>
echo $name                         <span class="cc"># reference with $: prints Alice</span>
echo "Hello, \${name}!"             <span class="cc"># braces for clarity</span>
readonly PI=3.14159                <span class="cc"># readonly: cannot be changed</span>
unset name                         <span class="cc"># delete a variable</span>

<span class="cc"># Environment variables (available to all child processes)</span>
export PATH="$PATH:/opt/mytools"   <span class="cc"># add /opt/mytools to command search path</span>
export EDITOR="nano"               <span class="cc"># set default text editor</span>
env                                <span class="cc"># list all environment variables</span>
echo $HOME $USER $SHELL $PATH      <span class="cc"># key built-in vars</span>

<span class="cc"># Aliases — create shortcuts for long commands</span>
alias ll="ls -lah"                 <span class="cc"># ll now runs ls -lah</span>
alias gs="git status"              <span class="cc"># quick git shortcut</span>
alias serve="python3 -m http.server 8080"
alias update="sudo apt update && sudo apt upgrade -y"
alias ..="cd .."                   <span class="cc"># go up one level</span>
alias ...="cd ../.."               <span class="cc"># go up two levels</span>
unalias ll                         <span class="cc"># remove an alias</span>
alias                              <span class="cc"># list all current aliases</span>

<span class="cc"># Make aliases permanent: add to ~/.bashrc (Bash) or ~/.zshrc (Zsh)</span>
echo 'alias ll="ls -lah"' >> ~/.bashrc
source ~/.bashrc                   <span class="cc"># reload config without restarting shell</span>`
    },
    {
      title:'Level 3 — Shell Scripting Foundations',
      body:`<p>A shell script is a text file containing a sequence of shell commands. Scripts automate repetitive tasks, combine commands with logic, and run unattended. Even basic scripting knowledge multiplies your productivity.</p>`,
      code:`<span class="cc">#!/bin/bash</span>
<span class="cc"># Every script starts with a shebang: tells kernel which interpreter to use</span>
<span class="cc"># Make executable: chmod +x script.sh   Run: ./script.sh</span>

<span class="cc"># Variables and user input</span>
<span class="cn">BACKUP_DIR</span>="/backup/$(date +%Y-%m-%d)"   <span class="cc"># variable with command substitution</span>
<span class="cf">read</span> -p "Enter filename: " filename     <span class="cc"># prompt user for input</span>

<span class="cc"># if/else conditional</span>
<span class="cf">if</span> [ -f "$filename" ]; <span class="cf">then</span>
    <span class="cs">echo</span> "File exists: $filename"
<span class="cf">elif</span> [ -d "$filename" ]; <span class="cf">then</span>
    <span class="cs">echo</span> "That's a directory, not a file"
<span class="cf">else</span>
    <span class="cs">echo</span> "File not found: $filename"
<span class="cf">fi</span>

<span class="cc"># for loop — iterate over items</span>
<span class="cf">for</span> server <span class="cf">in</span> web1 web2 web3; <span class="cf">do</span>
    <span class="cs">echo</span> "Checking $server..."
    ping -c1 "$server" &>/dev/null && <span class="cs">echo</span> "UP" || <span class="cs">echo</span> "DOWN"
<span class="cf">done</span>

<span class="cc"># while loop</span>
<span class="cn">count</span>=1
<span class="cf">while</span> [ $count -le 5 ]; <span class="cf">do</span>
    <span class="cs">echo</span> "Attempt $count"
    (( count++ ))
<span class="cf">done</span>

<span class="cc"># Functions</span>
check_disk() {
    <span class="cf">local</span> <span class="cn">threshold</span>=90
    <span class="cn">used</span>=$(df / | tail -1 | awk '{print $5}' | tr -d '%')
    [ "$used" -gt "$threshold" ] && <span class="cs">echo</span> "WARNING: Disk \${used}% full!"
}
check_disk`
    },
    {
      title:'The Complete Command-Line Mental Map',
      body:`<p>You have now covered the full breadth of Linux command-line interaction across three modules. Here is a final reference map of how every module and command type connects:</p>
<div class="diagram">
  <div class="diagram-title">Module 3 — Complete Linux Commands Reference</div>
  <div class="stack-item stack-active">🗂️ Part 1: Navigation — cd, ls, find, cp, mv, rm, mkdir, cat, less, tail</div>
  <div class="stack-arrow">↓ process the files you find with</div>
  <div class="stack-item stack-active">📝 Part 2: Text I/O — grep, sed, cut, sort, uniq, pipes |, redirect >, >></div>
  <div class="stack-arrow">↓ monitor what those commands spawn with</div>
  <div class="stack-item stack-active">⚙️ Part 3: Processes — ps, top, htop, kill, jobs, bg, fg, nice, pgrep</div>
  <div class="stack-arrow">↓ secured and owned via</div>
  <div class="stack-item stack-active">🔐 Part 4: Permissions — chmod, chown, sudo, tar, gzip, useradd</div>
  <div class="stack-arrow">↓ connected and managed across machines via</div>
  <div class="stack-item stack-active">🌐 Part 5: Network & Shell — ssh, curl, dig, apt, aliases, scripts</div>
</div>`,
      chips:[
        {label:'On your system: check logs',val:'tail -f /var/log/syslog | grep -i error — watch live for error events. Combine tail -f with grep to filter for what matters.'},
        {label:'On your system: disk cleanup',val:'find /var/log -name "*.gz" -mtime +30 -delete — remove old compressed logs. Always preview with find first before adding -delete.'},
        {label:'On your system: check who is logged in',val:'who or w — see connected users. last — login history. lastb — failed logins. These use /var/log/wtmp.'},
        {label:'On your system: one-liner system health',val:'echo "CPU:$(top -bn1|grep "Cpu(s)"|awk \'{print $2}\')% MEM:$(free -h|awk \'/Mem/{print $3"/"$4}\') DISK:$(df -h /|awk \'NR==2{print $5}\')"'},
        {label:'On your system: backup your home dir',val:'tar -czf ~/backup-$(date +%Y%m%d).tar.gz ~/Documents ~/Pictures ~/projects — dated backup in one command.'},
        {label:'On your system: install & harden SSH',val:'sudo apt install openssh-server → edit /etc/ssh/sshd_config → set PasswordAuthentication no after adding your key → sudo systemctl restart ssh'}
      ]
    }
  ],
  quiz:[
    {q:'Which command shows all processes currently listening on TCP ports with their process names?',opts:['netstat -t','ps aux | grep listen','ss -tlnp','ip addr show --listen'],ans:2,hint:'ss is the modern replacement for netstat. The flags: t=TCP, l=listening, n=numeric (no DNS), p=show process. This is the go-to command for "what is using this port?"'},
    {q:'You want to run a backup script that continues running even after you log out of SSH. Which is correct?',opts:['ssh backup.sh --persist','nohup ./backup.sh &','ctrl+Z then disown','sudo run --background backup.sh'],ans:1,hint:'nohup makes the command immune to the hangup signal (sent when SSH disconnects). The & sends it to background. Together they ensure the process survives after you log out.'},
    {q:'In a bash script, what does "if [ -f "$filename" ]" check?',opts:['Whether the variable $filename is not empty','Whether $filename is an executable file','-f tests if $filename exists AND is a regular file (not a directory or device)','Whether the filename has write permission'],ans:2,hint:'File test operators: -f = regular file, -d = directory, -e = exists (any type), -r = readable, -x = executable, -z = empty string. These are the most used ones in scripting.'},
    {q:'What must you do to make an alias permanent across terminal sessions?',opts:['Run "alias --save" to write it to the system','Add it to ~/.bashrc (or ~/.zshrc) and then source that file','Create it in /etc/aliases as root','Aliases are always permanent once set'],ans:1,hint:'Aliases defined interactively only last for that session. To persist them, add the alias command to your shell\'s startup file (~/.bashrc for Bash). Then source it to apply immediately.'},
    {q:'What is the complete interaction level hierarchy when you run: "find /var/log -name \'*.log\' -mtime +7 | xargs grep -l \'ERROR\' | xargs tar -czf old-errors.tar.gz"?',opts:['Level 1: simple file search only','Level 2: combines find with grep','Level 3: multi-stage pipeline using find, grep, tar and xargs to locate, filter, and archive old error logs in one line','This is not valid shell syntax'],ans:2,hint:'This pipeline chains 4 commands: find locates old logs, xargs+grep filters for ERROR-containing ones, then xargs+tar packages them. This is advanced Level 3 — composing multiple tools to automate a real admin task.'}
  ]
}
];

// Tag each topic with its module
const MODULE4 = [

// ─── PART 1: KERNEL ARCHITECTURE & CORE CONCEPTS ─────────────────
{
  id:'kernel-arch', num:'01',
  title:'Kernel Architecture & Core Concepts',
  subtitle:'What the Linux kernel is, how it is layered between hardware and user space, its four core responsibilities, the Ring 0/Ring 3 protection model, virtual memory via the MMU, and how the /proc pseudo-filesystem exposes kernel internals.',
  sections:[
    {
      title:'What Is the Linux Kernel?',
      body:`<p>The <span class="kw">Linux kernel</span> is the core of the operating system — the one program that runs with unrestricted access to the CPU and every piece of hardware. Everything else: your terminal, Firefox, systemd, even Python scripts — are user-space programs that work entirely through services the kernel provides.</p>
<p>The kernel is not the same as the operating system. A Linux distribution bundles the kernel together with a GNU toolchain, package manager, init system, and desktop environment. But the kernel itself is a single compressed binary image, typically found at <code>/boot/vmlinuz-&lt;version&gt;</code>.</p>
<div class="diagram">
  <div class="diagram-title">The Linux System Layering</div>
  <div class="stack-item stack-dim">👤 User Applications — Firefox, Terminal, Python, bash</div>
  <div class="stack-arrow">↓ only via system calls</div>
  <div class="stack-item stack-dim">📚 Standard Libraries — glibc, libstdc++ (wrap syscalls)</div>
  <div class="stack-arrow">↓ library calls</div>
  <div class="stack-item stack-active">⚙️ KERNEL SPACE — Linux Kernel (process mgmt, memory, devices, syscalls)</div>
  <div class="stack-arrow">↓ device drivers</div>
  <div class="stack-item stack-dim">🔩 HARDWARE — CPU, RAM, NVMe SSD, GPU, Network Card, USB</div>
</div>
<p>The critical boundary is between <span class="kw">kernel space (Ring 0)</span> and <span class="kw">user space (Ring 3)</span>. Hardware CPU protection rings enforce this: kernel code has unrestricted access to memory and hardware; user-space code cannot access hardware directly. An application bug causes only that process to crash. A kernel bug causes a <em>kernel panic</em> — the whole system halts.</p>`
    },
    {
      title:'The Four Kernel Responsibilities',
      body:`<p>The kernel manages four distinct areas (from <em>How Linux Works</em>, Chapter 1):</p>`,
      chips:[
        {label:'1. Process Management',val:'The kernel decides which processes use the CPU and when. It handles starting (fork), pausing, resuming, scheduling (context switching), and terminating processes. On a one-core CPU, only one process runs at a given instant — the kernel creates the illusion of multitasking via rapid context switches.'},
        {label:'2. Memory Management',val:'The kernel tracks all RAM: what is allocated to each process, what is shared, and what is free. It implements virtual memory via the CPU\'s MMU — every process believes it has the whole machine to itself, but the kernel maps virtual addresses to real physical locations via page tables.'},
        {label:'3. Device Drivers & Management',val:'Hardware devices are accessible only in kernel mode (a user process asking to turn off power would be catastrophic). The kernel acts as intermediary, providing a uniform interface to devices via drivers so user programs never talk to hardware directly.'},
        {label:'4. System Calls & Support',val:'System calls (syscalls) are the precisely defined interface between user space and the kernel. When an app needs to read a file, create a process, or send network data, it invokes a syscall — the CPU switches to kernel mode, the kernel performs the operation, then returns to user mode. Linux has ~340 syscalls.'}
      ]
    },
    {
      title:'Kernel Space vs User Space — In Depth',
      body:`<p>Understanding the kernel/user space split is fundamental to understanding everything about Linux security and stability:</p>
<ul>
<li><strong>Kernel Mode (Ring 0)</strong> — The kernel runs here. Full access to all memory, all CPU instructions, all hardware registers. A single bad pointer dereference can corrupt the entire system.</li>
<li><strong>User Mode (Ring 3)</strong> — All user processes run here. The CPU hardware prevents direct hardware access. Each process gets its own isolated virtual address space — process A cannot read process B's memory.</li>
<li><strong>Context Switching</strong> — When a process's time slice ends, an interrupt fires, the CPU switches to kernel mode, the kernel saves the process state, picks the next process, restores its state, and returns to user mode. This happens hundreds of times per second.</li>
<li><strong>Kernel Threads</strong> — The kernel can also run its own threads (e.g., <code>kthreadd</code>, <code>kblockd</code>) which look like processes in <code>ps</code> output (shown in brackets) but run entirely in kernel space.</li>
</ul>`,
      code:`# See all running kernel threads (names in [brackets])
ps aux | grep '\[' | head -20

# The kernel binary itself
ls -lh /boot/vmlinuz-$(uname -r)

# Which kernel version are you running?
uname -r
# Example output: 6.5.0-45-generic

# Full kernel information
uname -a
# Linux hostname 6.5.0-45-generic #45~22.04.1-Ubuntu SMP ...

# When was this kernel compiled?
cat /proc/version

# Kernel ring buffer — boot and runtime messages
dmesg | head -40
dmesg | tail -20

# View kernel boot messages (with timestamps)
dmesg -T | grep -E "error|warn|fail" --color=auto`
    },
    {
      title:'Virtual Memory and the MMU',
      body:`<p>The <span class="kw">Memory Management Unit (MMU)</span> is a CPU hardware component the kernel uses to implement virtual memory — one of Linux's most powerful abstractions:</p>
<ol>
<li><strong>Every process sees a private virtual address space</strong> — typically 0 to 2^47 bytes on 64-bit systems. The kernel and its memory are mapped into the top portion of every process's address space but are invisible and inaccessible from user mode.</li>
<li><strong>Page Tables</strong> — The kernel maintains a page table for each process: a mapping from virtual page numbers → physical page frames. When a process accesses memory, the MMU translates the virtual address via the page table to find the actual RAM location.</li>
<li><strong>Page Faults</strong> — If a process accesses a virtual page not currently in RAM, the CPU raises a page fault exception. The kernel handles it by loading the page from disk (swap) or filling it with zeros for new allocation.</li>
<li><strong>Copy-on-Write (COW)</strong> — When <code>fork()</code> creates a child process, the kernel does not copy all RAM immediately. Parent and child share the same physical pages, marked read-only. Only when one writes does the kernel copy the affected page — this makes <code>fork()</code> extremely fast.</li>
</ol>`,
      code:`# View memory usage summary
free -h
#              total   used    free    shared  buff/cache  available
# Mem:          15Gi    4.2Gi   7.1Gi   438Mi   4.2Gi       10Gi
# Swap:        2.0Gi    0B      2.0Gi

# Detailed process memory map (virtual address spaces)
cat /proc/$$/maps | head -20

# How much virtual memory does a process use?
cat /proc/self/status | grep -E "VmRSS|VmSize|VmPeak"
# VmPeak: peak virtual memory size
# VmSize: current virtual memory size
# VmRSS:  actual RAM in use (Resident Set Size)

# Kernel memory information
cat /proc/meminfo | head -20

# See page size (typically 4096 bytes = 4KB)
getconf PAGE_SIZE`
    },
    {
      title:'How the Kernel Sees Processes — /proc',
      body:`<p>The <span class="kw">/proc filesystem</span> is the kernel's window to the world. It is a <em>pseudo-filesystem</em> — not stored on disk, but created entirely in kernel memory and exposed as a directory tree. Every running process has an entry at <code>/proc/&lt;PID&gt;/</code>.</p>
<p>Key files inside <code>/proc/&lt;PID&gt;/</code>:</p>`,
      chips:[
        {label:'/proc/PID/status',val:'Human-readable process status: Name, State (R/S/D/Z), PID, PPID, memory usage (VmRSS, VmSize), thread count, UID/GID.'},
        {label:'/proc/PID/maps',val:'Memory map of the process — every virtual address range, what file it maps to, and permissions (r/w/x). Shows shared libraries, stack, heap.'},
        {label:'/proc/PID/fd/',val:'Directory of symbolic links — one per open file descriptor. fd/0=stdin, fd/1=stdout, fd/2=stderr. Shows all open files, sockets, pipes.'},
        {label:'/proc/PID/cmdline',val:'The exact command line that started the process (null-byte separated). Read with: cat /proc/PID/cmdline | tr "\\0" " "'},
        {label:'/proc/PID/environ',val:'All environment variables the process was started with (null-byte separated).'},
        {label:'/proc/cpuinfo',val:'Not per-process — describes every CPU core: model, MHz, cache size, flags (feature bits like avx, sse4_2).'},
        {label:'/proc/cmdline',val:'The kernel boot command line — parameters passed to the kernel by GRUB at boot time.'}
      ],
      code:`# Explore your own shell's /proc entry
echo "My PID is: $$"
ls /proc/$$

# See process status
cat /proc/$$/status

# See open file descriptors
ls -la /proc/$$/fd

# Read the command that started any process
cat /proc/1/cmdline | tr '\0' ' '
# Output: /sbin/init (this is systemd, PID 1)

# See kernel parameters passed at boot
cat /proc/cmdline
# BOOT_IMAGE=/boot/vmlinuz root=UUID=... ro quiet splash

# List ALL kernel parameters that can be tuned at runtime
ls /proc/sys/
# Contains: kernel/, net/, vm/, fs/ etc.`
    }
  ],
  quiz:[
    {q:'In the Linux kernel/user space model, which CPU protection ring does the kernel run in?',opts:['Ring 1','Ring 2','Ring 3','Ring 0'],ans:3,hint:'Ring 0 is the most privileged level — no restrictions on hardware or memory access. User processes run in Ring 3, the least privileged ring. The CPU hardware enforces this separation.'},
    {q:'What is a "context switch" in the Linux kernel?',opts:['Switching between two terminals','The act of the kernel saving one process\'s CPU state and loading another\'s to achieve multitasking','Changing the current working directory','Switching between kernel and user mode on a single process'],ans:1,hint:'Context switching is how the kernel creates the illusion of parallel execution. It saves registers/state of the outgoing process and restores the state of the incoming one — happening hundreds of times per second.'},
    {q:'What mechanism does the kernel use to implement virtual memory?',opts:['Swap partitions only','The CPU\'s Memory Management Unit (MMU) and per-process page tables','Direct memory allocation with malloc()','The /proc filesystem'],ans:1,hint:'The MMU is hardware built into the CPU. The kernel programs it with page tables — one per process — that map virtual addresses to physical RAM locations. This is what gives each process its own isolated address space.'},
    {q:'What is /proc in Linux?',opts:['A directory where programs are installed','A log file for process errors','A pseudo-filesystem created entirely in kernel memory that exposes runtime information about processes and kernel state','A package manager database'],ans:2,hint:'/proc is not on your hard disk — it exists only in RAM, generated by the kernel on-demand. It\'s the kernel\'s live status board. /proc/PID/ exists for every running process.'},
    {q:'When fork() creates a child process, what does Copy-on-Write (COW) mean?',opts:['The child immediately gets a full copy of all parent memory','Parent and child share the same physical pages until one writes, then the kernel copies only the modified page','The parent\'s memory is deleted after fork()','COW means the child inherits only read-only files'],ans:1,hint:'COW makes fork() very fast. Instead of copying gigabytes of memory, the kernel just marks shared pages as read-only. Only when a write occurs does it copy the single page that needs to differ.'}
  ]
},

// ─── PART 2: HOW THE KERNEL BOOTS ────────────────────────────────
{
  id:'kernel-boot', num:'02',
  title:'How the Kernel Boots',
  subtitle:'The complete journey from power-on through BIOS/UEFI, GRUB bootloader, kernel initialization, to the first user-space process — with practical GRUB and kernel parameter exploration.',
  sections:[
    {
      title:'The Boot Sequence — Overview',
      body:`<p>Understanding the boot process lets you fix boot failures, tune startup behaviour, and understand why Linux systems are structured the way they are. From <em>How Linux Works</em> Chapter 5, the sequence is:</p>
<ol>
<li><strong>BIOS/UEFI</strong> — Firmware runs a Power-On Self-Test (POST), initialises hardware, then searches for bootable storage. UEFI can read filesystems directly and loads boot loaders from the ESP (EFI System Partition).</li>
<li><strong>Boot Loader (GRUB)</strong> — The boot loader finds the kernel image on disk, loads it into RAM along with an initial RAM filesystem (<code>initrd</code>), and hands control to the kernel along with a set of kernel parameters.</li>
<li><strong>Kernel Initialisation</strong> — The kernel sets up the CPU, inspects and initialises memory, discovers hardware buses and devices, loads built-in drivers, mounts the root filesystem, and then starts the first user-space process.</li>
<li><strong>init / systemd</strong> — The kernel starts <code>/sbin/init</code> (which is systemd on modern distros) as PID 1. All other processes are descendants of PID 1.</li>
</ol>
<div class="diagram">
  <div class="diagram-title">Boot Sequence</div>
  <div class="stack-item stack-active">1️⃣ BIOS / UEFI Firmware — POST, find bootable device</div>
  <div class="stack-arrow">↓ hands off to</div>
  <div class="stack-item stack-active">2️⃣ GRUB Boot Loader — finds kernel, loads initrd, passes parameters</div>
  <div class="stack-arrow">↓ executes kernel</div>
  <div class="stack-item stack-active">3️⃣ Linux Kernel — CPU/memory setup, device init, mount root FS</div>
  <div class="stack-arrow">↓ starts PID 1</div>
  <div class="stack-item stack-active">4️⃣ systemd (PID 1) — starts all services, reaches target, shows login</div>
</div>`
    },
    {
      title:'BIOS vs UEFI',
      body:`<p>There are two firmware standards, and which one your machine uses affects how GRUB is installed and how secure boot works:</p>`,
      chips:[
        {label:'BIOS (Legacy)',val:'Traditional PC firmware. Boot code sits in the first 441 bytes of the disk\'s MBR (Master Boot Record). Very limited — no filesystem knowledge, no secure boot. Still common on older hardware.'},
        {label:'UEFI (Modern)',val:'Extensible Firmware Interface. Can read FAT32 filesystems. Has a dedicated EFI System Partition (ESP) — a FAT32 partition containing boot loaders. Supports Secure Boot (signed bootloaders only). Required for disks > 2TB.'},
        {label:'ESP (EFI System Partition)',val:'A FAT32 partition (usually mounted at /boot/efi) that UEFI firmware can directly read. GRUB for UEFI is installed here as a .efi file. Identified by UUID type EF00.'},
        {label:'Secure Boot',val:'UEFI feature that checks boot loaders and kernels against a database of trusted cryptographic signatures before executing them. Prevents malicious boot code. Linux distros ship signed kernels to support this.'},
        {label:'MBR Boot',val:'Legacy BIOS reads 512-byte MBR at disk sector 0. MBR contains: 446 bytes boot code + 64 bytes partition table + 2-byte signature. Boot code is too small for GRUB core, so GRUB installs additional code after the MBR.'},
        {label:'GPT Partitioning',val:'Modern replacement for MBR partition table. Supports disks > 2TB. Stores partition table at start AND end of disk (redundancy). Used with UEFI. The GUID Partition Table can have 128 partitions vs MBR\'s 4.'}
      ],
      code:`# Check if your system uses BIOS or UEFI
ls /sys/firmware/efi 2>/dev/null && echo "UEFI" || echo "BIOS"

# Alternative: efibootmgr shows boot entries if UEFI
efibootmgr
# If "EFI variables not supported" → BIOS system

# See all partitions including ESP
lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINT,UUID

# If you have UEFI: see the ESP contents
ls /boot/efi/EFI/
# Contains directories like: ubuntu/, BOOT/, Microsoft/

# Check partition table type (GPT vs MBR)
sudo fdisk -l /dev/sda | grep "Disk label"
# or
sudo parted /dev/sda print | grep "Partition Table"`
    },
    {
      title:'GRUB — Grand Unified Bootloader',
      body:`<p><span class="kw">GRUB</span> is the standard Linux bootloader. Its job: find the kernel image, load it plus the initial RAM filesystem into memory, and launch the kernel with the right parameters. GRUB has its own internal command shell, filesystem drivers, and module system — completely independent of the Linux kernel.</p>
<p>Key GRUB concepts:</p>
<ul>
<li><strong>GRUB "root"</strong> — Inside GRUB, "root" means the device/partition where GRUB looks for the kernel image. This is different from the Linux root filesystem. In GRUB config you'll see <code>set root='hd0,msdos1'</code> or a UUID search.</li>
<li><strong>grub.cfg</strong> — GRUB's configuration file at <code>/boot/grub/grub.cfg</code>. Contains <code>menuentry</code> blocks specifying which kernel to load and with what parameters. <strong>Never edit this file directly</strong> — it is auto-generated.</li>
<li><strong>grub-mkconfig</strong> — The tool that generates <code>grub.cfg</code> by running scripts in <code>/etc/grub.d/</code> and reading settings from <code>/etc/default/grub</code>. Run it as root after changing GRUB settings.</li>
</ul>`,
      code:`# View the current GRUB configuration
cat /boot/grub/grub.cfg | head -60

# See GRUB default settings
cat /etc/default/grub
# Key variables:
# GRUB_DEFAULT=0          → boot first entry by default
# GRUB_TIMEOUT=5          → wait 5 seconds
# GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"  → extra kernel params

# To change GRUB timeout to 10 seconds:
sudo nano /etc/default/grub
# Change: GRUB_TIMEOUT=10
# Then regenerate:
sudo grub-mkconfig -o /boot/grub/grub.cfg

# On Fedora/RHEL (uses grub2):
sudo grub2-mkconfig -o /boot/grub2/grub.cfg

# List installed kernels (Debian/Ubuntu)
ls /boot/vmlinuz-*

# See GRUB version
grub-install --version`
    },
    {
      title:'Kernel Parameters',
      body:`<p>When GRUB launches the kernel, it passes a set of <span class="kw">kernel parameters</span> (also called "boot parameters" or "cmdline"). These configure kernel behaviour before any user-space starts.</p>
<p>Important kernel parameters you'll encounter:</p>`,
      chips:[
        {label:'root=UUID=...',val:'Tells the kernel which device contains the root filesystem. Using UUID (not /dev/sda1) ensures correct identification regardless of device order changes.'},
        {label:'ro',val:'Mount the root filesystem read-only initially. This is normal — fsck can safely check it. After the check, systemd remounts it read-write.'},
        {label:'quiet',val:'Suppress most kernel boot messages from appearing on console. Without this, you see hundreds of lines of hardware detection output.'},
        {label:'splash',val:'Show a graphical splash screen (Plymouth) during boot instead of scrolling text messages.'},
        {label:'init=/bin/bash',val:'Override the first process. Instead of systemd, the kernel starts bash directly — gives you a root shell for emergency recovery.'},
        {label:'single / 1',val:'Boot into single-user mode (runlevel 1). Minimal environment, no networking — used for system recovery.'},
        {label:'nomodeset',val:'Disable kernel mode-setting for GPU. Forces basic display driver. Used when graphics drivers fail during boot.'},
        {label:'mem=2G',val:'Tell the kernel to use only 2GB of RAM — useful for testing on systems with more memory.'}
      ],
      code:`# See the exact parameters used for this boot
cat /proc/cmdline
# Example: BOOT_IMAGE=/boot/vmlinuz-6.5.0-45-generic
#          root=UUID=8b926... ro quiet splash

# To add a kernel parameter temporarily at boot:
# 1. Reboot, hold SHIFT to get GRUB menu
# 2. Press 'e' to edit the selected entry
# 3. Find the linux line, add your parameter at end
# 4. Press Ctrl+X or F10 to boot

# To add a parameter permanently:
sudo nano /etc/default/grub
# Edit: GRUB_CMDLINE_LINUX_DEFAULT="quiet splash your_param"
sudo grub-mkconfig -o /boot/grub/grub.cfg

# Emergency recovery: if system won't boot normally,
# add this parameter in GRUB editor to get a root shell:
# init=/bin/bash
# Then mount root rw: mount -o remount,rw /`
    },
    {
      title:'Kernel Initialisation Order',
      body:`<p>Once GRUB hands control to the kernel, the kernel initialises in a specific order (Chapter 5 of <em>How Linux Works</em>):</p>
<ol>
<li><strong>CPU inspection</strong> — Detect CPU type, features (SSE, AVX, etc.), number of cores.</li>
<li><strong>Memory inspection</strong> — Detect total RAM, build initial memory map.</li>
<li><strong>Device bus discovery</strong> — Scan PCI/USB buses for connected hardware.</li>
<li><strong>Device discovery & driver init</strong> — Load built-in drivers for each detected device.</li>
<li><strong>Auxiliary subsystem setup</strong> — Networking stack, virtual filesystem layer, etc.</li>
<li><strong>Root filesystem mount</strong> — Mount the root FS (using initrd if needed for early drivers).</li>
<li><strong>User space start</strong> — Execute <code>/sbin/init</code> (systemd) as the first user-space process, PID 1.</li>
</ol>
<p>The <span class="kw">initrd (initial RAM disk)</span> / <span class="kw">initramfs</span> is a small temporary filesystem the kernel loads into RAM before mounting the real root filesystem. It contains just enough drivers (e.g., LUKS encryption, RAID, LVM) to access the real root device.</p>`,
      code:`# View kernel startup messages (requires journald or dmesg)
journalctl -k        # kernel log from current boot
journalctl -k -b -1  # kernel log from previous boot

# Or use dmesg (ring buffer of recent kernel messages)
dmesg | head -50
dmesg -T | grep -i "mounted"
dmesg -T | grep -i "error\|fail" --color

# See when the system booted
who -b
# or
systemctl show | grep FirmwareTimestamp

# See the initrd image
ls -lh /boot/initrd.img-$(uname -r)

# What modules are included in the initrd?
lsinitramfs /boot/initrd.img-$(uname -r) | grep "\.ko" | head -20`
    }
  ],
  quiz:[
    {q:'What is the role of GRUB in the Linux boot sequence?',opts:['GRUB is the Linux kernel itself','GRUB is a shell that runs after login','GRUB is a boot loader: it finds the kernel image, loads it into RAM with the initrd, and launches it with kernel parameters','GRUB is the systemd init system'],ans:2,hint:'GRUB runs before the Linux kernel even starts. Its sole job is to get the kernel off disk and into RAM. It has its own shell and filesystem drivers independent of Linux.'},
    {q:'What does the kernel parameter "ro" do at boot time?',opts:['Enables read-only user accounts','Mounts the root filesystem read-only initially, so fsck can safely check it before remounting read-write','Disables all write operations permanently','Sets the runlevel to read-only mode'],ans:1,hint:'Starting with the root filesystem read-only is a safety measure. fsck (filesystem check) can only safely examine a filesystem that nobody is writing to. After the check passes, systemd remounts it read-write.'},
    {q:'What is the initramfs (initial RAM filesystem)?',opts:['The final root filesystem for embedded Linux','A compressed kernel module cache','A small temporary filesystem loaded by GRUB into RAM, containing early drivers needed to access the real root device','A backup copy of /etc/'],ans:2,hint:'Some systems need special drivers (LUKS encryption, RAID, LVM) to access their root partition, but these drivers aren\'t built into the kernel itself. The initramfs provides them as modules before the real root FS is mounted.'},
    {q:'Which file should you edit to permanently change GRUB settings (like timeout or kernel parameters)?',opts:['/boot/grub/grub.cfg directly','/etc/default/grub (then run grub-mkconfig)','/proc/cmdline','/etc/grub.conf'],ans:1,hint:'grub.cfg is auto-generated — any manual edits are overwritten the next time grub-mkconfig runs. The correct place is /etc/default/grub, and then you regenerate grub.cfg.'},
    {q:'When you add "init=/bin/bash" as a kernel parameter, what happens?',opts:['The kernel switches to graphical mode','bash replaces systemd as the first user-space process (PID 1) — giving you a raw root shell for emergency recovery','The kernel loads bash as a kernel module','It enables bash scripting support in the boot sequence'],ans:1,hint:'The "init=" parameter overrides what the kernel runs as its first process. Instead of systemd, it runs bash directly — giving you root access with no services running. Useful when systemd itself fails to start.'}
  ]
},

// ─── PART 3: PROCESSES & RESOURCE MANAGEMENT ─────────────────────
{
  id:'kernel-processes', num:'03',
  title:'Processes & Resource Management',
  subtitle:'How the kernel creates, schedules, and monitors processes — fork/exec, signals, process states, CPU scheduling, and the control groups (cgroups) mechanism that powers containers.',
  sections:[
    {
      title:'Process Lifecycle: fork() and exec()',
      body:`<p>In Linux, <strong>every process comes from another process</strong>. The kernel provides two fundamental syscalls for creating and running programs:</p>
<ul>
<li><span class="kw">fork()</span> — Creates a near-identical copy of the current process. The original is the <em>parent</em>; the new one is the <em>child</em>. Both continue running from the same point. The kernel uses Copy-on-Write so this is extremely fast.</li>
<li><span class="kw">exec()</span> — Replaces the current process's memory with a new program. After exec(), the process is running a completely different program but has the same PID.</li>
</ul>
<p>The typical pattern: when you type <code>ls</code> in bash, bash calls <code>fork()</code> to create a copy of itself, then the child calls <code>exec(ls)</code> to become the <code>ls</code> program. The parent (bash) waits for the child to finish.</p>
<p><strong>PID 1 is special</strong>. The kernel starts only one process directly — <code>/sbin/init</code> (systemd). Every other process is a descendant of PID 1 via fork/exec chains. The process tree is exactly that: a tree rooted at PID 1.</p>`,
      code:`# See the full process tree rooted at PID 1
pstree -p | head -40

# See parent-child relationships for your shell
echo "My PID: $$"
echo "My parent (PPID):"
cat /proc/$$/status | grep PPid

# Demonstrate fork/exec: bash creates a child for every command
# This shows PID of each command vs the shell
echo "Shell PID: $$"
bash -c 'echo "Child PID: $$, Parent: $PPID"'

# Watch a new process appear (run in one terminal, start something in another)
watch -n 0.5 'ps aux | tail -20'

# The init process (PID 1)
cat /proc/1/cmdline | tr '\0' ' '
# Output: /sbin/init (which is actually /lib/systemd/systemd)`
    },
    {
      title:'Process States',
      body:`<p>Every process is always in one of several states, managed by the kernel scheduler. The state is visible in the <code>STAT</code> column of <code>ps</code> output:</p>`,
      chips:[
        {label:'R — Running/Runnable',val:'The process is either currently executing on a CPU or waiting in the run queue ready to execute. High R count means CPU-bound load.'},
        {label:'S — Sleeping (Interruptible)',val:'The process is waiting for an event (user input, network data, a timer). Most processes spend most of their time here. Can be woken by a signal.'},
        {label:'D — Uninterruptible Sleep',val:'Waiting for I/O (usually disk I/O). Cannot be killed with signals — the kernel must complete the I/O first. High D count = disk I/O bottleneck.'},
        {label:'Z — Zombie',val:'The process has exited but its parent hasn\'t called wait() to collect its exit status. The process entry remains in the process table. A zombie consumes almost no resources.'},
        {label:'T — Stopped',val:'The process has been paused by SIGSTOP or Ctrl+Z. It is not running and not in the run queue. Resume with SIGCONT or the fg command.'},
        {label:'I — Idle Kernel Thread',val:'A kernel thread that is idle. Seen in newer kernels — similar to S but specifically for kernel threads with no active work.'}
      ],
      code:`# See process states
ps aux
# STAT column: S=sleeping, R=running, Z=zombie, D=uninterruptible

# Count processes by state
ps -eo state | sort | uniq -c | sort -rn

# Demonstrate process states:
# Create a zombie (child exits before parent calls wait)
bash -c '(sleep 0 &) ; sleep 10 &'
ps aux | grep 'sleep 0' | head -3

# Demonstrate Stopped state
sleep 100 &
kill -STOP $!       # pause the process
ps aux | grep "sleep 100"   # shows T (stopped)
kill -CONT $!       # resume it
kill $!             # terminate it`
    },
    {
      title:'Signals — Kernel IPC Mechanism',
      body:`<p><span class="kw">Signals</span> are asynchronous notifications sent to processes by the kernel or other processes. When a process receives a signal, its current execution is interrupted and a signal handler runs (or the default action — often terminate — occurs).</p>`,
      chips:[
        {label:'SIGTERM (15)',val:'Polite termination request. The default signal sent by kill. The process can catch this and clean up gracefully before exiting. This is the correct way to stop a service.'},
        {label:'SIGKILL (9)',val:'Forced, immediate kill. Cannot be caught, blocked, or ignored. The kernel removes the process without giving it a chance to clean up. Use as last resort: kill -9 PID.'},
        {label:'SIGHUP (1)',val:'Hangup — originally meant a modem disconnected. Daemons often use this as "reload configuration" signal: kill -HUP PID or systemctl reload service.'},
        {label:'SIGINT (2)',val:'Interrupt from keyboard — sent when you press Ctrl+C. Most programs terminate on SIGINT.'},
        {label:'SIGSTOP (19)',val:'Pause the process (cannot be caught). Ctrl+Z sends SIGTSTP (the catchable version). Resume with SIGCONT.'},
        {label:'SIGCHLD (17)',val:'Sent to parent when a child process exits. Allows the parent to call wait() and collect the exit status, preventing zombies.'}
      ],
      code:`# Send signals to processes
kill PID            # sends SIGTERM (15) — polite quit
kill -9 PID         # sends SIGKILL — force quit
kill -HUP PID       # sends SIGHUP — reload config
kill -STOP PID      # pause process
kill -CONT PID      # resume paused process

# Kill by name instead of PID
pkill firefox
killall nginx

# Send signal to process group
kill -TERM -PID     # negative PID = process group

# See all signal names
kill -l

# Practical: graceful reload of nginx config
sudo kill -HUP $(cat /var/run/nginx.pid)
# or equivalently:
sudo systemctl reload nginx

# Watch for signals being received by a process
strace -e trace=signal -p PID`
    },
    {
      title:'CPU Scheduling and Load Averages',
      body:`<p>The Linux <span class="kw">CFS (Completely Fair Scheduler)</span> decides which runnable process gets the CPU next. It aims to give each process a "fair" share of CPU time, with adjustable priorities via <span class="kw">nice values</span>.</p>
<ul>
<li><strong>Nice values</strong> range from -20 (highest priority) to +19 (lowest). Default is 0. Only root can set negative values.</li>
<li><strong>Load Average</strong> — The three numbers from <code>uptime</code> or <code>top</code> (e.g., "1.23 0.87 0.65") represent the average number of processes in the run queue over 1, 5, and 15 minutes. On a single-core system, load > 1 means the CPU is overloaded. On 4 cores, load > 4 is overloaded.</li>
<li><strong>CPU time accounting</strong> — The kernel tracks time spent in each state: <code>us</code> (user), <code>sy</code> (system/kernel), <code>id</code> (idle), <code>wa</code> (waiting for I/O), <code>hi</code> (hardware interrupts).</li>
</ul>`,
      code:`# See load averages and CPU count
uptime
# 14:32:01 up 3 days, load average: 0.42, 0.38, 0.31
# Load / number of CPUs = utilisation fraction

nproc           # number of CPU cores
lscpu | head -20  # detailed CPU info

# Real-time CPU per-core usage
mpstat -P ALL 1 3

# Monitor CPU in top (press 1 to expand all cores)
top
# Key columns: PID, %CPU, %MEM, STAT, TIME+, COMMAND

# Run a process with lower priority (nice +10)
nice -n 10 ./my_script.sh

# Change priority of running process
renice +5 -p PID
renice -5 -p PID   # requires root (negative = higher priority)

# See current nice value of processes
ps -eo pid,ni,comm | grep -v " 0 " | head -20`
    },
    {
      title:'Control Groups (cgroups) — Resource Limits',
      body:`<p><span class="kw">Control Groups (cgroups)</span> are a kernel feature that organises processes into hierarchical groups and applies resource limits and accounting to each group. They are the foundation of containers (Docker, Podman) and systemd service resource control.</p>
<p>cgroups can control: CPU time allocation, memory limits (hard limits that trigger OOM kill), I/O bandwidth, network priority, and number of processes.</p>
<p>There are two versions: <strong>cgroups v1</strong> (older, one hierarchy per resource type) and <strong>cgroups v2</strong> (unified hierarchy, standard on modern distros). systemd exclusively uses cgroups v2.</p>`,
      code:`# See cgroup version in use
mount | grep cgroup
# cgroup2 type cgroup2 = v2 in use

# See the cgroup hierarchy (systemd organises this)
systemd-cgls | head -40

# Every process belongs to a cgroup — see yours
cat /proc/$$/cgroup

# See resource usage by cgroup (systemd services)
systemd-cgtop

# View memory limit of a systemd service (if set)
systemctl show nginx | grep MemoryMax

# Set a memory limit on a service (requires root)
sudo systemctl set-property nginx.service MemoryMax=512M

# See current cgroup resource constraints for a slice
cat /sys/fs/cgroup/system.slice/memory.max
# "max" means no limit; a number means limit in bytes

# See which cgroup a process is in
cat /proc/PID/cgroup`
    }
  ],
  quiz:[
    {q:'In the fork()/exec() model, what does exec() do?',opts:['Creates a new child process','Sends a signal to a process','Replaces the current process\'s memory with a new program binary, keeping the same PID','Terminates the current process'],ans:2,hint:'fork() creates a new process; exec() transforms what that process IS. After exec(), the same PID is now running a completely different program. Together, fork+exec is how every shell command is launched.'},
    {q:'A process in state "D" (uninterruptible sleep) cannot be killed with kill -9. Why?',opts:['D-state processes have superuser protection','The process is in kernel mode performing I/O — the kernel must complete it; SIGKILL cannot interrupt kernel code in progress','D-state is only for zombie processes','kill -9 requires the -D flag for these processes'],ans:1,hint:'D state means the process is inside the kernel performing a blocking I/O operation. SIGKILL is delivered when the process returns to user mode — but since it\'s stuck waiting for the kernel, the signal can only be acted on after the I/O completes.'},
    {q:'What do the three numbers in load average (e.g., "2.10 1.75 1.20") represent?',opts:['CPU usage percentage over 1, 5, and 15 minutes','Number of processes in run queue averaged over 1, 5, and 15 minutes','Memory usage in GB at three different times','Number of context switches per second'],ans:1,hint:'Load average counts processes actively running OR waiting to run. On a 4-core system, a load of 4.0 means all cores are at 100%. A load of 2.0 on 4 cores = 50% utilised. Compare against nproc to assess load.'},
    {q:'What is the purpose of SIGTERM (signal 15) vs SIGKILL (signal 9)?',opts:['They are identical — both force-terminate the process','SIGTERM politely asks the process to quit (can be caught for cleanup); SIGKILL forcibly destroys the process immediately and cannot be caught','SIGTERM is for kernel threads, SIGKILL for user processes','SIGKILL is for graceful shutdown, SIGTERM for forced kill'],ans:1,hint:'Think of SIGTERM as "please stop when ready" and SIGKILL as "stop immediately, no discussion". A well-written daemon catches SIGTERM to flush buffers and close files cleanly. SIGKILL is a last resort for processes that won\'t respond.'},
    {q:'What Linux kernel feature do Docker and Podman use to isolate container CPU and memory resources?',opts:['Virtual machines','SELinux labels','Control Groups (cgroups)','iptables rules'],ans:2,hint:'Containers are not VMs — they are regular Linux processes that use two kernel features: namespaces (for isolation — they see a different PID tree, network, etc.) and cgroups (for resource limits — max memory, CPU share). The kernel enforces these limits.'}
  ]
},

// ─── PART 4: DEVICES, DRIVERS & THE FILESYSTEM LAYER ─────────────
{
  id:'kernel-devices', num:'04',
  title:'Devices, Drivers & Filesystems',
  subtitle:'How the kernel represents hardware as files in /dev, how udev manages device nodes dynamically, how kernel modules work, and how the VFS layer provides a uniform filesystem interface.',
  sections:[
    {
      title:'Device Files — Everything Is a File',
      body:`<p>One of Unix's most powerful abstractions is that <strong>hardware devices are represented as files</strong> in the <code>/dev</code> directory. This means you can use the same <code>read()</code> and <code>write()</code> syscalls to interact with a hard disk, a serial port, or a random number generator.</p>
<p>There are two types of device files:</p>
<ul>
<li><span class="kw">Block devices</span> — Transfer data in fixed-size blocks (sectors). Hard disks (<code>/dev/sda</code>), SSDs (<code>/dev/nvme0n1</code>), USB storage (<code>/dev/sdb</code>). Can be randomly accessed — you can seek to any block.</li>
<li><span class="kw">Character devices</span> — Transfer data as a stream of characters. Terminals (<code>/dev/tty</code>), serial ports (<code>/dev/ttyS0</code>), the null device (<code>/dev/null</code>), random number generator (<code>/dev/random</code>).</li>
</ul>
<p>Device files have two numbers: the <span class="kw">major number</span> (identifies which driver handles it) and the <span class="kw">minor number</span> (identifies the specific device instance).</p>`,
      chips:[
        {label:'/dev/sda, /dev/sdb',val:'SCSI/SATA hard disks. sda=first disk, sdb=second. Partitions: sda1, sda2. Block device.'},
        {label:'/dev/nvme0n1',val:'NVMe SSD. nvme0=first controller, n1=first namespace. Partitions: nvme0n1p1. Block device.'},
        {label:'/dev/null',val:'The bit bucket. Anything written here is discarded. Reading returns EOF immediately. cmd > /dev/null discards all output.'},
        {label:'/dev/zero',val:'Character device that produces an infinite stream of null bytes (0x00). Used to wipe disks, create zeroed files.'},
        {label:'/dev/random, /dev/urandom',val:'Kernel random number generator. /dev/urandom is non-blocking and cryptographically secure. Used by OpenSSL, ssh-keygen, etc.'},
        {label:'/dev/tty, /dev/pts/*',val:'Terminal devices. /dev/tty0 = current virtual console. /dev/pts/0 = first pseudo-terminal (your SSH session or terminal app).'}
      ],
      code:`# List block devices with their device files
lsblk
# Shows disk → partition hierarchy

# List device files with major/minor numbers
ls -l /dev/sd* /dev/nvme* 2>/dev/null
# brw-rw---- 1 root disk 8, 0 /dev/sda   ← 'b'=block, 8=major, 0=minor
# crw-rw---- 1 root tty  4, 0 /dev/tty0  ← 'c'=char

# Device type of specific files
file /dev/sda /dev/null /dev/random

# Write to /dev/null (discard)
ls /home 2>/dev/null   # discard errors

# Read random bytes
dd if=/dev/urandom bs=1 count=16 | xxd

# Your current terminal device
tty
# Output: /dev/pts/2 (pseudo-terminal #2)`
    },
    {
      title:'udev — Dynamic Device Management',
      body:`<p><span class="kw">udev</span> is the kernel's device manager in user space. When you plug in a USB drive, the kernel detects it and emits a <em>uevent</em>. The <code>udevd</code> daemon receives this event and creates the appropriate <code>/dev/sdX</code> entry, sets permissions, and optionally runs rules.</p>
<p><strong>devtmpfs</strong>: The kernel mounts a <code>devtmpfs</code> filesystem at <code>/dev</code>. The kernel itself creates basic device nodes here at boot (before udev starts), ensuring <code>/dev/null</code> and essential devices are always available.</p>
<p>udev rules (stored in <code>/etc/udev/rules.d/</code>) let you customise device handling: rename a network interface, assign persistent names to USB devices, set permissions, or trigger scripts when devices connect.</p>`,
      code:`# See recent kernel device events
udevadm monitor
# In another terminal: plug/unplug a USB device
# You'll see: KERNEL[...] add /devices/... (usb)

# Query udev information about a device
udevadm info /dev/sda
udevadm info --query=all --name=/dev/sda

# See all udev rules loaded
ls /etc/udev/rules.d/
ls /lib/udev/rules.d/

# Trigger udev rules re-evaluation (simulate plug events)
sudo udevadm trigger

# View kernel hardware events in real-time
sudo udevadm monitor --kernel --udev

# Find what kernel module handles a device
udevadm info /dev/sda | grep DRIVER

# See USB devices
lsusb
# See PCI devices
lspci | head -20`
    },
    {
      title:'Kernel Modules — Loadable Drivers',
      body:`<p>The Linux kernel is <span class="kw">modular</span>. Rather than compiling every possible driver into the kernel binary, drivers can be compiled as <span class="kw">kernel modules</span> — loadable pieces of kernel code stored as <code>.ko</code> files in <code>/lib/modules/$(uname -r)/</code>.</p>
<p>Benefits: smaller kernel binary, load drivers only when needed, update drivers without rebooting. The downside: a buggy module can crash the kernel (it runs in kernel space).</p>`,
      code:`# List all currently loaded kernel modules
lsmod
# NAME           SIZE  USED BY
# nvidia      35000000  84  nvidia_modeset,nvidia_drm

# Get detailed info about a module
modinfo ext4
modinfo nvidia | grep -E "^version:|^description:|^depends:"

# Load a module manually
sudo modprobe bluetooth
sudo modprobe -r bluetooth   # unload it

# Load module with parameters
sudo modprobe iwlwifi 11n_disable=1

# See which modules are available for your hardware
ls /lib/modules/$(uname -r)/kernel/ | head -10

# See module dependencies
cat /lib/modules/$(uname -r)/modules.dep | head -5

# Automatically loaded modules (by udev on device detection)
cat /proc/modules | wc -l   # how many are loaded right now

# Blacklist a module (prevent auto-loading)
echo "blacklist nouveau" | sudo tee /etc/modprobe.d/blacklist-nouveau.conf
sudo update-initramfs -u   # rebuild initrd without the module`
    },
    {
      title:'The Virtual Filesystem (VFS)',
      body:`<p>The <span class="kw">Virtual Filesystem Switch (VFS)</span> is the kernel layer that provides a single unified interface to all filesystems. Because of VFS, the same <code>open()</code>, <code>read()</code>, <code>write()</code> syscalls work identically whether you're accessing ext4, XFS, tmpfs, NTFS, or a network filesystem (NFS, CIFS).</p>
<p>VFS defines abstract objects — inodes, directory entries, file objects — and every filesystem driver implements these abstractions for its own format. Applications never know which underlying filesystem they're using.</p>`,
      chips:[
        {label:'ext4',val:'Default Linux filesystem. Journaling prevents corruption. Supports files up to 16TB, volumes up to 1EB. Most compatible choice.'},
        {label:'XFS',val:'High-performance 64-bit filesystem. Excellent for large files and parallel I/O. Default on RHEL/CentOS. Handles very large directories efficiently.'},
        {label:'Btrfs',val:'Modern copy-on-write filesystem. Built-in snapshots, checksums (data integrity), compression, subvolumes. Default on openSUSE/Fedora.'},
        {label:'tmpfs',val:'RAM-backed filesystem. /tmp and /run are usually tmpfs — files disappear on reboot. Very fast. Size is limited to available RAM.'},
        {label:'proc / sysfs',val:'Pseudo-filesystems exposing kernel data. /proc = process info. /sys = hardware and driver info via sysfs. Neither stored on disk.'},
        {label:'Inodes',val:'The kernel\'s internal representation of a file: permissions, owner, timestamps, size, and pointers to data blocks. Every file has exactly one inode. Filename→inode mapping is stored in directory entries.'}
      ],
      code:`# See filesystems mounted right now
df -hT
# -T shows filesystem type: ext4, tmpfs, vfat, etc.

# Detailed mount info
cat /proc/mounts
# or
findmnt

# Inode usage (important: you can run out of inodes before disk space)
df -i

# See inode number of files
ls -li /etc/passwd
# 2097153 -rw-r--r-- 1 root root 2847 ...
# ↑ inode number

# What filesystem type is this partition?
stat -f /home
blkid /dev/sda1

# Mount a filesystem manually
sudo mount /dev/sdb1 /mnt
sudo mount -t tmpfs -o size=512M tmpfs /mnt/ram
sudo umount /mnt

# See all supported filesystem types
cat /proc/filesystems`
    },
    {
      title:'The sysfs Interface — Hardware via Filesystem',
      body:`<p><span class="kw">sysfs</span> (mounted at <code>/sys</code>) is a kernel pseudo-filesystem that exposes the kernel's internal device model as a directory hierarchy. Every hardware device the kernel knows about has a directory under <code>/sys/devices/</code>. Kernel subsystems expose tunable parameters here.</p>
<p>sysfs is how user space (including udev) communicates with drivers. You can read hardware properties and, in many cases, write values to change driver behaviour — without needing a special utility.</p>`,
      code:`# Explore the sysfs hierarchy
ls /sys/
# block/ bus/ class/ dev/ devices/ firmware/ fs/ module/ power/

# See all block devices
ls /sys/block/

# Battery status (on laptops)
cat /sys/class/power_supply/BAT0/status      # Charging/Discharging/Full
cat /sys/class/power_supply/BAT0/capacity    # percentage 0-100

# CPU frequency scaling
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_available_governors

# Brightness control (change display brightness)
cat /sys/class/backlight/*/max_brightness
echo 500 | sudo tee /sys/class/backlight/intel_backlight/brightness

# Network interface statistics
cat /sys/class/net/eth0/statistics/rx_bytes
cat /sys/class/net/eth0/statistics/tx_bytes

# Kernel tunable parameters via /proc/sys
cat /proc/sys/vm/swappiness        # default 60
echo 10 | sudo tee /proc/sys/vm/swappiness  # reduce swap aggressiveness

# Persistent sysctl settings
cat /etc/sysctl.conf
sudo sysctl -p    # reload sysctl.conf`
    }
  ],
  quiz:[
    {q:'What is the difference between a block device and a character device in Linux?',opts:['Block devices are faster; character devices are slower','Block devices transfer data in fixed-size blocks and support random access (like disks); character devices stream data sequentially (like terminals, /dev/null)','Block devices are for storage only; character devices are for network','The terms are interchangeable — they are the same thing'],ans:1,hint:'Think of "block" like a random-access storage device (you can seek to block 1000 directly) vs "character" like a serial stream (bytes arrive one after another in order). Hard disks are block; terminal devices are character.'},
    {q:'What is the role of udev in the Linux system?',opts:['udev is the kernel scheduler','udev is a user-space daemon that listens for kernel device events (uevents) and creates/removes /dev entries, sets permissions, and runs rules when hardware connects or disconnects','udev is the filesystem driver for /dev','udev manages user login sessions'],ans:1,hint:'When you plug in a USB drive, the kernel detects it and emits a uevent. udevd receives this, looks at its rule files, creates /dev/sdb, sets the right owner/permissions, and might auto-mount it. udev bridges kernel hardware detection and user-space device files.'},
    {q:'What is a kernel module (.ko file)?',opts:['A kernel configuration option file','A loadable piece of kernel code (typically a device driver) that can be inserted and removed at runtime without rebooting','A user-space library for kernel interaction','A compressed kernel image file'],ans:1,hint:'Modules allow the kernel to be extended without recompilation. lsmod shows loaded modules; modprobe loads them; modprobe -r removes them. This is why you can plug in a new USB device and the driver loads automatically via udev+modprobe.'},
    {q:'What does the Virtual Filesystem Switch (VFS) provide?',opts:['Virtual machine filesystem support','A uniform syscall interface (open, read, write) that works identically regardless of the underlying filesystem type (ext4, XFS, tmpfs, NFS)','A RAM-based filesystem for /tmp','The /proc and /sys pseudo-filesystems only'],ans:1,hint:'VFS is an abstraction layer. The application calls read() and doesn\'t know if it\'s reading from ext4, NFS, or tmpfs. VFS translates the syscall to the appropriate filesystem driver\'s implementation. This is why "everything is a file" works in Linux.'},
    {q:'What is an inode in the Linux filesystem?',opts:['A network socket identifier','The kernel\'s internal data structure for a file — storing permissions, owner, timestamps, size, and pointers to data blocks (but NOT the filename)','A directory entry that maps filename to data','A block device sector address'],ans:1,hint:'The filename-to-inode mapping lives in directory entries. The inode itself contains everything else about the file except its name. This is why hard links work: two different names can point to the same inode. Run ls -i to see inode numbers.'}
  ]
},

// ─── PART 5: KERNEL TUNING, MONITORING & PRACTICAL MASTERY ───────
{
  id:'kernel-tuning', num:'05',
  title:'Kernel Tuning, Monitoring & Practical Mastery',
  subtitle:'Inspect live kernel state with /proc and /sys, tune kernel parameters with sysctl, interpret system resource metrics, trace syscalls with strace, and understand the kernel upgrade process.',
  sections:[
    {
      title:'Reading the Kernel — /proc Deep Dive',
      body:`<p>The <code>/proc</code> filesystem is your primary tool for inspecting live kernel state. Every number the kernel tracks about processes, memory, networking, and hardware is accessible here as a readable file — no special tools needed, just <code>cat</code>.</p>`,
      chips:[
        {label:'/proc/cpuinfo',val:'Every CPU core\'s details: vendor, model, frequency (MHz), cache sizes, and feature flags (sse4_2, avx2, aes — indicates hardware AES encryption). One block per core.'},
        {label:'/proc/meminfo',val:'Complete memory statistics: MemTotal/MemFree/MemAvailable (available ≠ free — includes reclaimable cache), Buffers, Cached, SwapTotal/SwapFree, Slab (kernel data structures).'},
        {label:'/proc/net/tcp',val:'Active TCP connections in hex format. Each row: local address:port, remote address:port, state (01=ESTABLISHED, 0A=LISTEN). Better read via ss or netstat.'},
        {label:'/proc/diskstats',val:'I/O statistics per block device: reads/writes completed, sectors read/written, time spent in I/O (ms). Used by iotop and iostat.'},
        {label:'/proc/loadavg',val:'The five values: load 1min, 5min, 15min, running/total processes (e.g., 2/312), last PID assigned.'},
        {label:'/proc/sys/',val:'Kernel tunable parameters. Files here can be read and written to change live kernel behaviour. Same values as sysctl. Organised in subdirs: kernel/, vm/, net/, fs/.'}
      ],
      code:`# Complete system memory breakdown
cat /proc/meminfo

# All CPU details
cat /proc/cpuinfo

# Network connections (raw hex)
cat /proc/net/tcp | head -5

# Disk I/O stats
cat /proc/diskstats

# Running processes count / total
cat /proc/loadavg

# Key kernel limits
cat /proc/sys/fs/file-max        # max open file descriptors system-wide
cat /proc/sys/kernel/pid_max     # maximum PID number
cat /proc/sys/vm/swappiness      # 0-100, aggressiveness of swapping

# Number of open file descriptors right now
cat /proc/sys/fs/file-nr
# output: current_open  0  max_open`
    },
    {
      title:'sysctl — Kernel Parameter Tuning',
      body:`<p><span class="kw">sysctl</span> is the tool for reading and writing kernel parameters exposed via <code>/proc/sys/</code>. Many of these parameters significantly affect system performance, security, and behaviour.</p>
<p>Common tuning categories: <strong>vm.*</strong> (virtual memory), <strong>net.*</strong> (networking), <strong>kernel.*</strong> (core kernel behaviour), <strong>fs.*</strong> (filesystem limits).</p>`,
      code:`# View ALL tunable kernel parameters
sysctl -a 2>/dev/null | head -30

# Read a specific parameter
sysctl vm.swappiness
# vm.swappiness = 60

# Change a parameter live (resets on reboot)
sudo sysctl -w vm.swappiness=10

# Make changes persistent across reboots
echo "vm.swappiness = 10" | sudo tee /etc/sysctl.d/99-custom.conf
sudo sysctl -p /etc/sysctl.d/99-custom.conf

# ── Common tuning scenarios ──────────────────────────────

# 1. Increase max open file descriptors (for high-load servers)
sudo sysctl -w fs.file-max=2097152

# 2. Enable IP forwarding (required for routing / containers)
sudo sysctl -w net.ipv4.ip_forward=1

# 3. Reduce swappiness (prefer RAM over swap — good for desktops)
sudo sysctl -w vm.swappiness=10

# 4. Increase network buffer sizes (for high-throughput networks)
sudo sysctl -w net.core.rmem_max=134217728
sudo sysctl -w net.core.wmem_max=134217728

# 5. Enable SYN flood protection
sudo sysctl -w net.ipv4.tcp_syncookies=1`
    },
    {
      title:'Resource Monitoring — CPU, Memory, I/O',
      body:`<p>Effective kernel-level monitoring uses these tools (covered in depth in <em>How Linux Works</em> Chapter 8):</p>`,
      code:`# ── CPU Monitoring ─────────────────────────────────────────

# Overall CPU usage (interactive)
top
htop      # more visual (may need: sudo apt install htop)

# CPU usage summary (1-second snapshots, 5 iterations)
mpstat 1 5

# Per-process CPU usage
pidstat -u 1 5

# Which process is using the most CPU?
ps aux --sort=-%cpu | head -10

# ── Memory Monitoring ───────────────────────────────────────

# Memory summary
free -h

# See what's using memory (processes sorted by RSS)
ps aux --sort=-%mem | head -10

# Virtual memory statistics (1-second snapshots)
vmstat 1 5
# procs: r=runnable b=blocked
# memory: swpd=swap used free=free buff=buffers cache=cached
# cpu: us sy id wa st (user sys idle iowait steal)

# ── Disk I/O Monitoring ─────────────────────────────────────

# Real-time I/O per process
sudo iotop -o        # -o: only show processes doing I/O

# I/O statistics per device
iostat -xz 1 5
# %util: percentage of time device was busy (100% = saturated)
# await: average I/O wait time in ms

# ── All-in-one ──────────────────────────────────────────────
# Install sysstat for mpstat, iostat, pidstat, sar
sudo apt install sysstat     # Debian/Ubuntu
sudo dnf install sysstat     # Fedora/RHEL`
    },
    {
      title:'strace — Tracing System Calls',
      body:`<p><span class="kw">strace</span> intercepts and records every system call a process makes. It is one of the most powerful debugging tools on Linux — when a program "doesn't work," strace tells you exactly what the kernel is (or isn't) doing for it.</p>
<p>strace works by using the <code>ptrace()</code> syscall, which allows one process to observe and control another — the same mechanism debuggers (gdb) use.</p>`,
      code:`# Trace all syscalls made by a command
strace ls /home

# Count syscalls (summary mode — very useful)
strace -c ls /home
# % time  seconds  usecs/call  calls  errors  syscall
# ──────  ───────  ──────────  ─────  ──────  ────────
#  45.2%  0.000141          9     15          mmap
#  ...

# Trace only specific syscalls (filter)
strace -e trace=open,read,write ls /home

# Trace file-related syscalls only
strace -e trace=file ls /home

# Trace a running process by PID
sudo strace -p PID

# Trace with timestamps
strace -t ls /home      # wall-clock time
strace -T ls /home      # time spent in each syscall

# Find why a program can't open a file
strace -e trace=file myprogram 2>&1 | grep "ENOENT\|EACCES"
# ENOENT = no such file   EACCES = permission denied

# Trace all processes including children (forks)
strace -f bash -c "ls && pwd"

# Save trace to file for analysis
strace -o /tmp/trace.log ls /home`
    },
    {
      title:'Kernel Upgrades and Module 4 Synthesis',
      body:`<p>The kernel is just another package on Linux — it can be updated without reinstalling the OS. Understanding upgrades completes your kernel knowledge:</p>
<ul>
<li>On Ubuntu/Debian: <code>sudo apt update && sudo apt upgrade</code> updates the kernel. The new kernel is installed alongside the old one in <code>/boot/</code>. GRUB is updated automatically. Old kernels are kept as fallback.</li>
<li>On Fedora/RHEL: <code>sudo dnf update kernel</code>. Similarly keeps old kernels.</li>
<li>A reboot is required to use the new kernel — only the running kernel can be replaced on disk, not in RAM.</li>
<li><strong>kexec</strong> — An advanced mechanism to load a new kernel from within a running system without BIOS/UEFI boot cycle. Used for faster reboots on servers.</li>
</ul>
<div class="diagram">
  <div class="diagram-title">Module 4 — Linux Kernel Mastery Map</div>
  <div class="stack-item stack-active">🏗️ Part 1: Architecture — kernel space/user space, VMM, /proc, four responsibilities</div>
  <div class="stack-arrow">↓ kernel loads via</div>
  <div class="stack-item stack-active">🚀 Part 2: Boot — BIOS/UEFI, GRUB, initrd, kernel parameters, init sequence</div>
  <div class="stack-arrow">↓ kernel manages</div>
  <div class="stack-item stack-active">⚙️ Part 3: Processes — fork/exec, states, signals, scheduling, cgroups</div>
  <div class="stack-arrow">↓ kernel exposes hardware via</div>
  <div class="stack-item stack-active">🔌 Part 4: Devices — /dev files, udev, kernel modules, VFS, sysfs</div>
  <div class="stack-arrow">↓ all observable and tunable via</div>
  <div class="stack-item stack-active">🔧 Part 5: Tuning — /proc, sysctl, monitoring, strace, upgrades</div>
</div>`,
      code:`# ── Kernel upgrade workflow ──────────────────────────────────

# Check current kernel
uname -r

# List installed kernels (Ubuntu/Debian)
dpkg --list | grep linux-image

# Update all packages including kernel
sudo apt update && sudo apt upgrade

# After reboot — verify new kernel
uname -r

# Remove old kernels (Ubuntu helper)
sudo apt autoremove

# ── Quick reference: key kernel commands ─────────────────────

uname -r            # kernel version
dmesg -T | tail     # recent kernel messages
journalctl -k       # full kernel journal
cat /proc/cmdline   # boot parameters used
cat /proc/meminfo   # memory details
cat /proc/cpuinfo   # CPU details
lsmod               # loaded kernel modules
modprobe MODULE     # load a module
sysctl -a           # all tunable parameters
strace -c COMMAND   # count syscalls used
lsblk               # block devices
udevadm monitor     # watch device events live`
    }
  ],
  quiz:[
    {q:'Which /proc file tells you the exact kernel parameters that were passed at boot time?',opts:['/proc/boot','/proc/cmdline','/proc/sys/kernel/parameters','/proc/kernel/cmdline'],ans:1,hint:'cat /proc/cmdline shows you exactly what GRUB passed to the kernel: root=UUID=..., ro, quiet, splash, and any custom parameters you added. It\'s the live record of what was used for this boot.'},
    {q:'You want to permanently increase vm.swappiness to avoid aggressive swapping. What is the correct method?',opts:['Edit /proc/sys/vm/swappiness directly','Add "vm.swappiness = 10" to /etc/sysctl.d/99-custom.conf then run sudo sysctl -p','Run sudo sysctl -w vm.swappiness=10 (this persists across reboots automatically)','Edit /etc/default/grub and add the parameter'],ans:1,hint:'sysctl -w changes the parameter live but it resets on reboot. For persistence, you put the setting in /etc/sysctl.d/ or /etc/sysctl.conf, then reload with sysctl -p. The /proc/sys files reflect the live value.'},
    {q:'A web server on your machine fails to start and shows a "permission denied" error reading a config file. Which strace command helps diagnose this?',opts:['strace -e trace=network nginx','strace -e trace=file nginx 2>&1 | grep EACCES','strace -c nginx 2>&1','strace -p 1 nginx'],ans:1,hint:'EACCES is the errno for "permission denied". Filtering strace output for file-related syscalls and grepping for EACCES or ENOENT (no such file) immediately shows you exactly which file cannot be accessed and why.'},
    {q:'What does vmstat output show in its "wa" column?',opts:['Number of wakeup interrupts per second','Percentage of CPU time spent waiting for I/O (disk) to complete','Write ahead log entries','Worker thread allocation count'],ans:1,hint:'In vmstat\'s cpu columns: us=user, sy=system/kernel, id=idle, wa=iowait, st=steal. High wa% (>20%) means the CPU is mostly idle but waiting for disk I/O — your bottleneck is disk speed, not CPU.'},
    {q:'After installing a kernel update on Ubuntu (apt upgrade), when does the new kernel take effect?',opts:['Immediately — the running kernel is hot-patched','After running sudo kernel-switch','After rebooting — the new kernel is installed in /boot and GRUB is updated, but you must reboot to load it into RAM','The next time you log out and log in'],ans:3,hint:'The kernel is a program that runs in RAM from boot time. You can update the files in /boot/ while the system runs, but the running kernel in RAM cannot replace itself. A reboot is required to load the new kernel via GRUB.'}
  ]
}
];


MODULE1.forEach(t => { t.module = 1; });
MODULE2.forEach(t => { t.module = 2; });
MODULE3.forEach(t => { t.module = 3; });
MODULE4.forEach(t => { t.module = 4; });

const MODULE5 = [

// ─── PART 1: CPU & EXECUTION ─────────────────────────────────────
{
  id:'hw-cpu', num:'21',
  title:'CPU & Execution',
  subtitle:'How the processor fetches, decodes and executes instructions — and how the Linux kernel controls every aspect of CPU behaviour, from scheduling to power states.',
  sections:[
    {
      title:'The CPU\'s Fundamental Loop',
      body:`<p>Every program you run ultimately reduces to a repeating cycle inside the CPU called the <span class="kw">fetch-decode-execute cycle</span>. The CPU retrieves an instruction from memory, figures out what it means, runs it, then immediately moves on to the next one — billions of times per second.</p>
<p>Modern CPUs are nothing like the textbook pipeline. They are <strong>superscalar</strong> (execute multiple instructions per clock), <strong>out-of-order</strong> (reorder instructions to avoid stalls), and <strong>speculative</strong> (guess branches and execute ahead). The CPU is continuously in motion, with hundreds of in-flight instructions at once.</p>
<div class="diagram">
  <div class="diagram-title">CPU Pipeline — Instructions in Flight</div>
  <div class="stack-item stack-active">📥 FETCH — Load instruction bytes from L1 instruction cache</div>
  <div class="stack-arrow">↓</div>
  <div class="stack-item stack-active">🔍 DECODE — Parse opcode, identify operands, check dependencies</div>
  <div class="stack-arrow">↓</div>
  <div class="stack-item stack-active">📋 DISPATCH — Send to execution unit (ALU / FPU / Load-Store)</div>
  <div class="stack-arrow">↓</div>
  <div class="stack-item stack-active">⚡ EXECUTE — Perform the operation (arithmetic, memory access, branch)</div>
  <div class="stack-arrow">↓</div>
  <div class="stack-item stack-active">✍️ WRITE-BACK — Store result in register or cache</div>
</div>`
    },
    {
      title:'CPU Rings, Modes and Context Switches',
      body:`<p>The CPU operates in distinct <span class="kw">privilege modes</span> enforced entirely in hardware. On x86-64, there are four rings (0–3), but Linux uses only two: Ring 0 (kernel) and Ring 3 (user). The hardware <em>enforces</em> these — you cannot bypass them in software.</p>
<p>When a user program makes a <strong>syscall</strong>, the CPU performs a <span class="kw">mode switch</span>: it saves the user-space register state, switches to Ring 0, jumps to a kernel handler, and later restores state to return. This is called a <strong>context switch</strong> and costs ~100–1000 ns per transition.</p>`,
      chips:[
        {label:'Ring 0 — Kernel Mode',val:'Full hardware access. Can execute privileged instructions (HLT, LGDT, CR3 writes). Kernel code runs here.'},
        {label:'Ring 3 — User Mode',val:'Restricted. Cannot access I/O ports, modify page tables, or halt CPU. All app code runs here.'},
        {label:'SYSCALL instruction',val:'x86-64 fast syscall. Atomically switches to Ring 0 and jumps to kernel entry point in ~100 ns.'},
        {label:'Context Switch Cost',val:'~1–3 µs per switch. Involves TLB flush, cache thrash, register save/restore, CR3 reload.'},
        {label:'Interrupt Gate',val:'Hardware IRQs (keyboard, NIC, timer) also trigger Ring 0 entry — preempting whatever was running.'},
        {label:'CR3 Register',val:'Holds physical address of current page table. Changed on every process switch — this swaps virtual address spaces.'}
      ]
    },
    {
      title:'CPU Caches — L1, L2, L3',
      body:`<p>Main memory (DRAM) takes ~100 ns to access. A CPU running at 3 GHz executes an instruction every ~0.3 ns. Without caching, the CPU would spend 99% of its time waiting for memory. The <span class="kw">cache hierarchy</span> solves this:</p>`,
      chips:[
        {label:'L1 Cache',val:'~32–64 KB per core. Split into I$ (instructions) and D$ (data). Latency: ~4–5 cycles. Always private to each core.'},
        {label:'L2 Cache',val:'~256 KB–1 MB per core. Unified data+instructions. Latency: ~12 cycles (~4 ns). Core-private.'},
        {label:'L3 Cache (LLC)',val:'~8–64 MB, shared across all cores. Latency: ~40 cycles. Last stop before DRAM. Miss here = ~100 ns DRAM fetch.'},
        {label:'Cache Line (64 bytes)',val:'The atomic transfer unit. Reading 1 byte fetches 64 bytes. Sequential access reuses lines; random access wastes them.'},
        {label:'Cache Miss',val:'L1 miss: ~5 ns. L2 miss: ~12 ns. L3 miss: ~40 ns. DRAM: ~100 ns. A 20× difference between L1 hit and DRAM.'},
        {label:'Linux Cache-Aligned Data',val:'Kernel structs use __cacheline_aligned to prevent false sharing between cores on adjacent cache lines.'}
      ],
      code:`<span class="cc"># View CPU cache sizes</span>
lscpu | grep -i cache
<span class="cc"># L1d:  256 KiB  L1i: 256 KiB  L2: 4 MiB  L3: 32 MiB</span>

<span class="cc"># Detailed per-core cache topology</span>
cat /sys/devices/system/cpu/cpu0/cache/index2/size
cat /sys/devices/system/cpu/cpu0/cache/index3/shared_cpu_list
<span class="cc"># 0-15  (L3 shared by all 16 cores)</span>`
    },
    {
      title:'CPU Frequency Scaling & Power States',
      body:`<p>Modern CPUs do not run at a fixed frequency. The Linux <span class="kw">cpufreq</span> subsystem dynamically adjusts frequency and voltage — saving power when idle, boosting speed under load.</p>
<p><strong>P-states</strong> control active frequency. <strong>C-states</strong> represent progressively deeper sleep when the CPU is idle.</p>`,
      chips:[
        {label:'C0 — Active',val:'CPU executing instructions. Full power.'},
        {label:'C1 — Halt',val:'CPU clock stopped, still powered. Exit latency ~1 µs.'},
        {label:'C3 — Sleep',val:'Caches flushed, clocks gated. Exit latency ~50–100 µs. Good power savings.'},
        {label:'C6/C7 — Deep Sleep',val:'Core fully power-gated. Exit latency ~200 µs. Maximum per-core savings.'},
        {label:'Turbo Boost',val:'Intel Turbo / AMD Precision Boost: exceeds base clock (e.g., 3.6→5.0 GHz) when thermal headroom allows.'},
        {label:'schedutil governor',val:'Integrates with CFS scheduler. High load → raise freq. Idle → lower. Default on modern Linux.'}
      ],
      code:`<span class="cc"># Check current CPU frequencies</span>
cat /proc/cpuinfo | grep "cpu MHz"

<span class="cc"># Current governor</span>
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor

<span class="cc"># Switch to performance (disable scaling)</span>
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

<span class="cc"># Check C-state names and residency</span>
cat /sys/devices/system/cpu/cpu0/cpuidle/state*/name`
    },
    {
      title:'SMP, NUMA and CPU Topology',
      body:`<p>Modern systems have multiple <span class="kw">cores</span>, each with <span class="kw">hyperthreading</span> (2 logical CPUs per core). Linux represents this through <strong>SMP</strong> and schedules work across all topology levels.</p>
<p>On multi-socket servers, memory is <span class="kw">NUMA (Non-Uniform Memory Access)</span>: each CPU socket has local RAM. Accessing the other socket's RAM crosses the chip-to-chip interconnect (Intel QPI / AMD Infinity Fabric) — 2–4× slower than local access.</p>`,
      code:`<span class="cc"># View full CPU topology</span>
lscpu
<span class="cc"># Thread(s) per core: 2  (hyperthreading ON)</span>
<span class="cc"># Core(s) per socket: 8</span>
<span class="cc"># Socket(s): 1</span>

<span class="cc"># NUMA hardware layout</span>
numactl --hardware

<span class="cc"># Pin process to specific CPU core</span>
taskset -c 0 ./my_program

<span class="cc"># Set affinity of running process</span>
taskset -p 0x3 1234   <span class="cc"># CPUs 0 and 1</span>

<span class="cc"># Per-CPU interrupt distribution</span>
cat /proc/interrupts`
    }
  ],
  quiz:[
    {q:'What hardware mechanism prevents a user-space process from directly accessing kernel memory or I/O ports?',opts:['The OS firewall','CPU privilege rings enforced in silicon — not software','The virtual filesystem layer','Mandatory access control (SELinux)'],ans:1,hint:'This protection is implemented in the CPU hardware itself. Linux uses Ring 0 (kernel) and Ring 3 (user). The CPU enforces the boundary — software cannot bypass it.'},
    {q:'What is a CPU cache line, and why does it matter for performance?',opts:['A register bank holding 64 instructions','The 64-byte unit transferred between cache and RAM — sequential access reuses lines, random access wastes them','A kernel struct for CPU scheduling','The pipeline stage that decodes instructions'],ans:1,hint:'When the CPU fetches even 1 byte from DRAM, it loads 64 bytes into cache. Sequential reads reuse this block; random access causes 64-byte loads for every access.'},
    {q:'What does a CPU C-state represent?',opts:['A compiler optimisation flag','The current frequency P-state multiplier','An idle sleep state where parts of the CPU are powered down to save energy','A hardware interrupt controller state'],ans:2,hint:'C-states are idle sleep modes. C0 = actively executing. C6/C7 = core power fully gated off. The deeper the C-state, the more power saved and the longer the wake-up latency.'},
    {q:'On a NUMA system, what makes accessing the other socket\'s RAM slower?',opts:['Remote DDR uses a slower generation','Data must travel over the CPU interconnect (QPI/Infinity Fabric) adding latency','The kernel throttles remote access intentionally','Page table walks are longer for remote addresses'],ans:1,hint:'NUMA = Non-Uniform Memory Access. Local socket RAM is fast; remote socket RAM requires crossing the chip interconnect — 2–4× more latency.'},
    {q:'What does the "schedutil" cpufreq governor do?',opts:['Locks CPU at max frequency','Locks CPU at min frequency','Dynamically adjusts frequency based on the CFS scheduler\'s load signal','Randomly assigns frequencies to test thermal limits'],ans:2,hint:'schedutil hooks into the CFS scheduler. High runqueue utilization → raise frequency. Low load → lower frequency. It is the modern default governor on most Linux distros.'}
  ]
},

// ─── PART 2: MEMORY ARCHITECTURE ─────────────────────────────────
{
  id:'hw-memory', num:'22',
  title:'Memory Architecture',
  subtitle:'How physical RAM is managed by the kernel — virtual memory, page tables, the MMU, swap, and what really happens when your application allocates memory.',
  sections:[
    {
      title:'Physical Memory & DRAM',
      body:`<p>Your system RAM is <span class="kw">DRAM (Dynamic RAM)</span> — capacitors organised into rows and columns that must be refreshed thousands of times per second or they lose data. DRAM is dense and cheap but slower than CPU caches by 50–200×.</p>
<p>At boot, the BIOS/UEFI provides the kernel with a <span class="kw">memory map (E820)</span> describing which physical address ranges are usable RAM, which are reserved for ACPI tables, and which are faulty. The kernel builds its physical memory manager from this map.</p>`,
      chips:[
        {label:'DRAM Page (4 KB)',val:'The kernel\'s fundamental unit of physical memory. A 16 GB system has ~4 million physical page frames.'},
        {label:'Memory Channels',val:'Dual-channel = 2 DRAM modules accessed in parallel, doubling bandwidth. Quad-channel used in servers.'},
        {label:'ECC RAM',val:'Error-Correcting Code RAM detects/corrects single-bit errors. Mandatory for servers. Consumer systems use non-ECC.'},
        {label:'MMIO',val:'Hardware devices (GPU VRAM, NIC, PCIe config space) appear as physical memory address ranges. The CPU reads/writes them like RAM.'},
        {label:'Buddy Allocator',val:'The kernel\'s physical page allocator. Manages 2^n contiguous page blocks. Used by page fault handler and kmalloc.'},
        {label:'/proc/meminfo',val:'Live physical memory accounting. "Cached" pages are reusable (not wasted). "Available" = free + reclaimable cache.'}
      ],
      code:`<span class="cc"># See physical memory map from BIOS</span>
dmesg | grep "BIOS-e820"
<span class="cc"># [mem 0x000000000009e000-0x000000000009ffff] reserved</span>
<span class="cc"># [mem 0x0000000000100000-0x00000000bfecffff] usable</span>

<span class="cc"># Live memory breakdown</span>
cat /proc/meminfo
<span class="cc"># MemTotal: 16384000 kB    MemFree: 923456 kB</span>
<span class="cc"># Cached:    8234120 kB    Buffers: 456000 kB</span>

<span class="cc"># Physical buddy allocator state</span>
cat /proc/buddyinfo

<span class="cc"># RAM hardware details</span>
sudo dmidecode --type 17 | grep -E "Size|Speed|Type"`
    },
    {
      title:'Virtual Memory & Page Tables',
      body:`<p>Every process believes it owns the full 64-bit address space. This illusion is <span class="kw">virtual memory</span> — the hardware <span class="kw">MMU</span> translates each virtual address to a physical address using <strong>page tables</strong> (a 4-level tree on x86-64: PGD→PUD→PMD→PTE).</p>
<p>The <span class="kw">TLB (Translation Lookaside Buffer)</span> caches recent translations. A TLB hit = ~1 cycle. A TLB miss = walk the 4-level tree = ~tens of cycles. Context-switching flushes the TLB, which is a key cost of switching processes.</p>`,
      chips:[
        {label:'Virtual Address Space',val:'Each process has its own private 48-bit virtual address space. Kernel in top half, user code in bottom half.'},
        {label:'Page Table Entry',val:'Maps one 4 KB virtual page to one physical frame. Bits: present, read/write, user/kernel, dirty, accessed, NX.'},
        {label:'TLB',val:'64–2048 entry hardware cache of virtual→physical translations. TLB miss = full page table walk.'},
        {label:'Huge Pages (2 MB)',val:'512× fewer TLB entries vs 4 KB pages. Critical for databases and JVMs. Enable via Transparent Huge Pages.'},
        {label:'Copy-on-Write (CoW)',val:'After fork(): parent+child share physical pages (read-only). Only on first write does kernel copy the page.'},
        {label:'mmap()',val:'Maps files or anonymous memory into virtual address space. The basis of malloc, shared libraries, file I/O.'}
      ],
      code:`<span class="cc"># Virtual memory map of current process</span>
cat /proc/self/maps
<span class="cc"># 55a3b2400000-55a3b2401000 r--p ... /usr/bin/bash</span>
<span class="cc"># 7ffd4b000000-7ffd4b021000 rw-p ... [stack]</span>

<span class="cc"># Virtual vs physical memory for a process</span>
cat /proc/1234/status | grep -E "VmSize|VmRSS|VmSwap"
<span class="cc"># VmSize = virtual reserved, VmRSS = physical in RAM</span>

<span class="cc"># Check Transparent Huge Pages</span>
cat /sys/kernel/mm/transparent_hugepage/enabled

<span class="cc"># TLB miss stats</span>
perf stat -e dTLB-load-misses -a sleep 5`
    },
    {
      title:'Page Faults and Demand Paging',
      body:`<p>When a process accesses a virtual address with no physical page mapped, the CPU raises a <span class="kw">page fault</span>. The kernel's page fault handler allocates a physical page, maps it in the page table, and resumes the process transparently. This is <strong>demand paging</strong> — pages are only allocated when first accessed.</p>
<p>This is why <code>malloc(1GB)</code> can succeed on a system with 512 MB free — no physical RAM is allocated until you write to it. And why processes appear to use more virtual memory than physical memory.</p>`,
      chips:[
        {label:'Minor Page Fault',val:'Kernel maps an already-allocated page (e.g., shared library page already in RAM). Fast — no disk I/O. ~1 µs.'},
        {label:'Major Page Fault',val:'Kernel must read page from disk (swap, file). Slow — ms range. High major fault rate = thrashing.'},
        {label:'Anonymous Pages',val:'Process heap and stack pages with no file backing. Swapped to swap partition/file when evicted from RAM.'},
        {label:'File-backed Pages',val:'Pages from mapped files (executables, libraries, mmap\'d files). Evicted by simply discarding — re-read from file on next access.'},
        {label:'OOM Killer',val:'When RAM+swap exhausted, the kernel kills the process with the highest oom_score to free memory.'},
        {label:'oom_score_adj',val:'Per-process OOM adjustment: -1000 = never kill (use for sshd). +1000 = kill first. Default: 0.'}
      ],
      code:`<span class="cc"># Watch page faults during program execution</span>
perf stat -e page-faults,major-faults ./my_program

<span class="cc"># OOM score for a process (higher = killed sooner)</span>
cat /proc/$(pgrep firefox)/oom_score

<span class="cc"># Protect a process from OOM killer</span>
echo -1000 | sudo tee /proc/$(pgrep sshd)/oom_score_adj

<span class="cc"># Check if OOM killer has fired recently</span>
dmesg | grep -i "out of memory\|oom"

<span class="cc"># Detailed memory breakdown per process</span>
cat /proc/1234/smaps | grep -E "Rss|Pss|Swap"`
    },
    {
      title:'Swap Space',
      body:`<p><span class="kw">Swap</span> is disk space used as overflow when physical RAM is exhausted. The kernel's page reclaim subsystem evicts cold (rarely-accessed) anonymous pages to swap, freeing RAM for other uses. When those pages are needed again, a <strong>major page fault</strong> reads them back — hundreds of times slower.</p>`,
      chips:[
        {label:'swappiness (0–200)',val:'Default 60. 0 = only swap when desperate. 200 = aggressively swap to preserve page cache. Set 10–20 on desktops.'},
        {label:'Swap Partition',val:'Dedicated disk partition for swap. Fastest swap type. Created during OS installation.'},
        {label:'Swapfile',val:'Regular file used as swap. Flexible — can be created any time. Slightly slower than partition.'},
        {label:'zram',val:'Compressed RAM disk used as swap. 2–3× effective RAM capacity with no disk I/O. Default on Android and some distros.'},
        {label:'zswap',val:'Kernel feature that compresses pages before sending to swap partition. Reduces disk I/O by ~50%.'},
        {label:'Thrashing',val:'System spends more time swapping than running apps. Symptom: system unresponsive, high iowait%, major fault rate spikes.'}
      ],
      code:`<span class="cc"># Check swap usage</span>
swapon --show
free -h

<span class="cc"># Current swappiness</span>
cat /proc/sys/vm/swappiness

<span class="cc"># Reduce swappiness for desktop use</span>
sudo sysctl vm.swappiness=10
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf

<span class="cc"># Create a 4 GB swapfile</span>
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

<span class="cc"># Check zram (Ubuntu/Fedora often enable this)</span>
lsblk | grep zram`
    },
    {
      title:'Kernel Memory Allocators',
      body:`<p>The kernel itself needs memory — for process descriptors, network buffers, filesystem caches, and thousands of other objects. It uses a layered allocation system different from user-space malloc:</p>`,
      chips:[
        {label:'Buddy Allocator',val:'Physical page allocator. Manages 2^n contiguous page blocks (4 KB to 4 MB). Used for large kernel allocations and user page faults.'},
        {label:'Slab/SLUB Allocator',val:'Object cache on top of buddy allocator. Pre-allocates pools of fixed-size objects (inodes, dentries, sk_buff). Avoids fragmentation and per-allocation overhead.'},
        {label:'kmalloc()',val:'General kernel memory allocator (like malloc for kernel code). Backed by SLUB for sizes up to 8 MB. Physically contiguous memory.'},
        {label:'vmalloc()',val:'Allocates virtually-contiguous (not physically) kernel memory. For large allocations where physical contiguity isn\'t required.'},
        {label:'Memory Zones',val:'Kernel divides physical RAM into zones: ZONE_DMA (first 16 MB, legacy ISA DMA), ZONE_NORMAL, ZONE_HIGHMEM (32-bit only). Allocation tries normal zone first.'},
        {label:'slab stats',val:'/proc/slabinfo shows all slab caches, their sizes, and usage. "dentry" and "inode_cache" are typically largest.'}
      ],
      code:`<span class="cc"># Show kernel slab allocator caches</span>
cat /proc/slabinfo | head -20
<span class="cc"># name  active_objs  num_objs  objsize  objperslab</span>
<span class="cc"># dentry  134562  145920  192  21</span>

<span class="cc"># Memory zone breakdown</span>
cat /proc/zoneinfo | grep -E "Node|zone|free"

<span class="cc"># Total kernel memory usage</span>
cat /proc/meminfo | grep -E "Slab|KernelStack|PageTables"
<span class="cc"># Slab:          1234567 kB (kernel object caches)</span>
<span class="cc"># KernelStack:    56789 kB  (one 8-16 KB stack per thread)</span>
<span class="cc"># PageTables:     23456 kB  (page table overhead per process)</span>`
    }
  ],
  quiz:[
    {q:'When a process calls malloc(1GB), is physical RAM immediately allocated?',opts:['Yes — the kernel reserves physical pages immediately','No — virtual address space is reserved but physical pages are only allocated on first write (demand paging)','Yes, but only if 1 GB of RAM is free','No — malloc() never touches the kernel'],ans:1,hint:'Demand paging: virtual address space (VmSize) is reserved immediately, but physical RAM (VmRSS) is only committed when the program actually writes to the memory.'},
    {q:'What is the TLB and what happens when it misses?',opts:['A disk buffer; a miss causes a disk read','A hardware cache of virtual→physical address translations; a miss requires walking the 4-level page table, costing tens of cycles','A kernel process scheduler; a miss causes a context switch','A CPU branch predictor; a miss causes pipeline flush'],ans:1,hint:'The TLB caches recent virtual→physical translations. Without it, every memory access would need 4 page table lookups. A TLB miss triggers the hardware page table walker.'},
    {q:'What does Copy-on-Write (CoW) mean after fork()?',opts:['Child immediately gets a full copy of all parent memory','Parent and child share physical pages (read-only); a copy is made only when either writes','The kernel suspends parent while child copies memory','The child starts with empty memory and loads from disk'],ans:1,hint:'CoW makes fork() very cheap — no data is copied until modified. If the child immediately calls exec(), almost nothing is copied. The kernel marks pages read-only and copies on first write.'},
    {q:'What does the OOM Killer do and when does it activate?',opts:['Kills all processes when CPU reaches 100% usage','Kills the process with the highest oom_score when both RAM and swap are exhausted, to allow the system to continue running','Terminates the kernel and reboots the system','Swaps all processes to disk to free RAM'],ans:1,hint:'OOM = Out Of Memory. The killer activates only when RAM + swap are completely full. It scores processes (memory usage, priority, oom_score_adj) and kills the biggest offender.'},
    {q:'What does reducing "swappiness" to a low value (e.g., 10) tell the kernel to do?',opts:['Disable swap completely','Only use swap as a last resort — prefer dropping file cache over evicting process memory to swap','Use swap aggressively to keep file cache in RAM','Increase swap partition size automatically'],ans:1,hint:'swappiness balances two reclaim targets: anonymous memory (process heap/stack, goes to swap) vs file-backed pages (page cache, can just be dropped). Low swappiness = prefer dropping cache over swapping.'}
  ]
},

// ─── PART 3: STORAGE HARDWARE & I/O ──────────────────────────────
{
  id:'hw-storage', num:'23',
  title:'Storage Hardware & I/O',
  subtitle:'How data travels from a spinning disk or NVMe SSD through device drivers, the block layer, and filesystems to become the files your programs read and write.',
  sections:[
    {
      title:'Storage Device Types',
      body:`<p>Linux supports a wide range of storage hardware, each with dramatically different performance. Understanding your device explains why your system behaves the way it does:</p>`,
      chips:[
        {label:'HDD (Hard Disk Drive)',val:'Spinning magnetic platters. Seek time: ~5–10 ms. Sequential: ~100–200 MB/s. Random IOPS: ~100–200. Cheapest per GB.'},
        {label:'SATA SSD',val:'Flash with SATA interface (600 MB/s max). Sequential: ~500 MB/s. Random IOPS: ~100,000. 500× faster random I/O than HDD.'},
        {label:'NVMe SSD (PCIe)',val:'Flash over PCIe direct to CPU. Sequential: 3,000–7,000 MB/s. Random IOPS: ~1,000,000. Latency: ~100 µs. Current performance standard.'},
        {label:'eMMC / UFS',val:'Soldered flash in phones and ARM boards. UFS 3.1: ~2,100 MB/s read. Cannot be swapped/upgraded.'},
        {label:'Software RAID',val:'Linux mdadm: RAID 0 (stripe, speed), RAID 1 (mirror, redundancy), RAID 5/6 (parity). No special hardware required.'},
        {label:'Device Detection',val:'ROTA=1 means rotational (HDD). ROTA=0 means SSD/NVMe. Check: cat /sys/block/sda/queue/rotational'}
      ],
      code:`<span class="cc"># List all block devices with types</span>
lsblk -o NAME,SIZE,TYPE,ROTA,MODEL
<span class="cc"># ROTA=0: SSD/NVMe. ROTA=1: HDD</span>

<span class="cc"># NVMe device info</span>
sudo nvme list
sudo nvme id-ctrl /dev/nvme0

<span class="cc"># Quick sequential write benchmark</span>
dd if=/dev/zero of=/tmp/test bs=1M count=1024 oflag=direct
<span class="cc"># oflag=direct bypasses page cache for accurate measurement</span>

<span class="cc"># NVMe SMART health data</span>
sudo nvme smart-log /dev/nvme0
<span class="cc"># percentage_used: 2%  ← SSD wear indicator</span>`
    },
    {
      title:'The Block I/O Stack',
      body:`<p>When your program calls <code>write()</code>, data doesn't go directly to disk. It traverses multiple kernel layers:</p>
<div class="diagram">
  <div class="diagram-title">Linux Block I/O Stack — write() to disk</div>
  <div class="stack-item stack-active">📝 Application: write(fd, buf, n) → syscall</div>
  <div class="stack-arrow">↓</div>
  <div class="stack-item stack-active">📁 VFS (Virtual Filesystem): abstract file operations</div>
  <div class="stack-arrow">↓</div>
  <div class="stack-item stack-active">📂 Filesystem (ext4/xfs/btrfs): manage inodes, extents, journal</div>
  <div class="stack-arrow">↓</div>
  <div class="stack-item stack-active">💾 Page Cache: buffer writes in RAM; serve reads from cache</div>
  <div class="stack-arrow">↓ writeback daemon flushes dirty pages</div>
  <div class="stack-item stack-active">📦 Block Layer (blk-mq): merge/reorder requests per CPU queue</div>
  <div class="stack-arrow">↓</div>
  <div class="stack-item stack-active">🔌 Device Driver (NVMe/AHCI): DMA transfer to hardware</div>
  <div class="stack-arrow">↓</div>
  <div class="stack-item stack-dim">🔩 Storage Hardware — NVMe SSD / HDD</div>
</div>`,
      chips:[
        {label:'Page Cache',val:'Kernel caches disk data in RAM. Repeated file reads served from cache in microseconds, not milliseconds. "Cached" in /proc/meminfo.'},
        {label:'Dirty Pages',val:'Modified cache pages not yet written to disk. Flushed every ~30 s by kworker threads. "Dirty" in /proc/meminfo.'},
        {label:'fsync()',val:'Forces all dirty pages for a file to disk immediately. Essential for databases. Without it, a power loss loses recent writes.'},
        {label:'I/O Scheduler',val:'mq-deadline/bfq for HDDs (reorder to avoid seek). "none" for NVMe (hardware queues handle ordering internally).'},
        {label:'DMA',val:'NIC/storage controller writes data directly into RAM without CPU involvement. CPU sets up transfer, device does the work, raises interrupt when done.'},
        {label:'Block Size',val:'Default 4 KB, matching memory page size. Misaligned partitions cause read-modify-write penalties on HDDs.'}
      ]
    },
    {
      title:'NVMe Deep Dive',
      body:`<p><span class="kw">NVMe</span> was designed for flash storage, replacing the decades-old SCSI/ATA protocols built for spinning disks. NVMe connects directly to the CPU via PCIe — no separate SATA controller.</p>
<p>The key NVMe innovation: up to 65,535 parallel queues each with 65,535 outstanding commands. Linux's <span class="kw">blk-mq</span> (multi-queue block layer) maps one submission queue per CPU core to NVMe hardware queues — zero inter-CPU coordination needed.</p>`,
      code:`<span class="cc"># NVMe queues — one per CPU core</span>
ls /sys/block/nvme0n1/mq/
<span class="cc"># 0  1  2  3  4  5  6  7  (8-core system)</span>

<span class="cc"># I/O scheduler (none = hardware handles it)</span>
cat /sys/block/nvme0n1/queue/scheduler
<span class="cc"># [none] mq-deadline kyber bfq</span>

<span class="cc"># NVMe SMART health</span>
sudo nvme smart-log /dev/nvme0
<span class="cc"># critical_warning: 0  temperature: 35 C</span>
<span class="cc"># data_units_written: 41290752  (×512 KB blocks)</span>

<span class="cc"># Queue depth</span>
cat /sys/block/nvme0n1/queue/nr_requests   <span class="cc"># 1023</span>`
    },
    {
      title:'Filesystems — How Data Is Organised',
      body:`<p>A <span class="kw">filesystem</span> imposes structure on raw blocks: <strong>inodes</strong> (metadata: permissions, timestamps, block map) and <strong>data blocks</strong> (content).</p>`,
      chips:[
        {label:'ext4',val:'Default on Ubuntu/Debian. Mature, journaled, extents-based. Max file: 16 TB. Recovery after crash: ~seconds via journal replay.'},
        {label:'XFS',val:'Default on RHEL/Fedora. Excellent parallel writes, large files. Delayed allocation, online resize. Preferred for storage servers.'},
        {label:'Btrfs',val:'Copy-on-write filesystem. Built-in RAID, snapshots, checksums, compression. Default on Fedora. More complex but feature-rich.'},
        {label:'tmpfs',val:'RAM-backed filesystem. /tmp and /run are tmpfs. Extremely fast — no disk I/O. Data lost on reboot. Size = RAM+swap.'},
        {label:'Journaling',val:'Filesystem journal logs changes before applying. On crash, replay journal to recover consistent state (no fsck needed).'},
        {label:'Inodes',val:'Each file has one inode: UID/GID, permissions, size, timestamps, data block pointers. Directories map filenames to inode numbers.'}
      ],
      code:`<span class="cc"># Check filesystem types and usage</span>
df -Th
<span class="cc"># /dev/nvme0n1p2 ext4  50G 23G 25G 48% /</span>
<span class="cc"># tmpfs          tmpfs 7.8G 1.2G 6.6G 16% /dev/shm</span>

<span class="cc"># Inode usage (small-file workloads can exhaust inodes)</span>
df -i

<span class="cc"># Inspect a file's inode</span>
stat /etc/passwd
<span class="cc"># Inode: 656041  Links: 1  Blocks: 8</span>

<span class="cc"># Tune mount for performance (noatime = skip access time update)</span>
cat /proc/mounts | grep " / "`
    },
    {
      title:'I/O Monitoring & Tuning',
      body:`<p>Finding I/O bottlenecks requires observing the kernel and devices in real time. Linux provides rich I/O observability through <code>/proc</code>, <code>/sys</code>, and perf tools.</p>`,
      code:`<span class="cc"># Real-time per-device I/O stats</span>
iostat -xz 1
<span class="cc"># %util = saturation (100% = device fully busy)</span>
<span class="cc"># await = avg I/O wait ms  r/s w/s = ops/sec</span>
<span class="cc"># rkB/s wkB/s = throughput KB/s</span>

<span class="cc"># Which processes are doing most I/O</span>
sudo iotop -a

<span class="cc"># Dirty page writeback thresholds</span>
sysctl vm.dirty_ratio             <span class="cc"># % RAM before forced flush (default 20)</span>
sysctl vm.dirty_background_ratio  <span class="cc"># % RAM to start background flush (default 10)</span>

<span class="cc"># Force flush all dirty pages NOW</span>
sync && echo 3 | sudo tee /proc/sys/vm/drop_caches

<span class="cc"># Read-ahead for sequential workloads</span>
cat /sys/block/nvme0n1/queue/read_ahead_kb   <span class="cc"># default 128 KB</span>`
    }
  ],
  quiz:[
    {q:'A program calls write() but does not call fsync(). The system crashes 10 seconds later. Is the data on disk?',opts:['Yes — write() always flushes to disk synchronously','No — data may still be in the page cache (dirty pages) and could be lost before the writeback daemon flushes','Yes, as long as the file was opened in write mode','No — write() only copies to a user buffer; the kernel never writes automatically'],ans:1,hint:'write() puts data in the page cache in RAM. The kernel flushes dirty pages every ~30 seconds by default. fsync() forces immediate flush. Databases always call fsync() after committing transactions.'},
    {q:'What does "ROTA=0" mean in the lsblk output?',opts:['The disk spins at 0 RPM when idle','The device is solid-state (SSD/NVMe) — no rotating parts — which affects I/O scheduler selection','RAID is disabled on the device','The device is read-only'],ans:1,hint:'Linux checks the rotational flag to decide on I/O scheduling strategy. Rotational (HDD) benefits from request reordering to reduce seek. Non-rotational (SSD) handles parallelism internally.'},
    {q:'Why does Linux use the "none" I/O scheduler for NVMe devices by default?',opts:['NVMe is too fast for any scheduler to track','NVMe hardware has internal multi-queue command management — a software scheduler just adds latency without benefit','Linux does not support scheduling PCIe devices','NVMe bypasses the block layer entirely'],ans:1,hint:'HDD schedulers exist to eliminate mechanical seek time. NVMe has no seek time and processes 65,535 commands per queue in hardware. Adding a software reorder layer just adds overhead.'},
    {q:'What is the difference between inode exhaustion and block exhaustion on a filesystem?',opts:['They are the same thing','Block exhaustion = no space for file data. Inode exhaustion = no metadata slots for new files — can occur even when blocks are available','Inode exhaustion affects only directories, not files','Block exhaustion only affects binary files'],ans:1,hint:'Each file needs one inode (metadata slot). The inode count is fixed at mkfs time. Workloads with millions of small files (logs, emails) can run out of inodes while plenty of block space remains. df -i shows inode usage.'},
    {q:'What does fsync() do that write() does not?',opts:['fsync() uses DMA to write faster than write()','fsync() forces all dirty pages for the file from the page cache to the physical disk, guaranteeing durability','fsync() bypasses the filesystem and writes directly to the block device','fsync() flushes only the file\'s metadata, not its data'],ans:1,hint:'write() places data in the page cache (RAM buffer). fsync() waits until the OS and device confirm all data is physically written to non-volatile storage. Databases rely on fsync() after every committed transaction.'}
  ]
},

// ─── PART 4: NETWORKING STACK ─────────────────────────────────────
{
  id:'hw-network', num:'24',
  title:'Networking Stack',
  subtitle:'How network packets travel from the NIC hardware through kernel drivers, the TCP/IP stack, socket buffers, and syscalls — all the way to your application.',
  sections:[
    {
      title:'NIC Hardware & Interrupts',
      body:`<p>Your <span class="kw">NIC (Network Interface Card)</span> is a PCIe device with its own processor, ring buffers in RAM, and DMA engine. When a packet arrives, the NIC writes it directly into a kernel ring buffer via DMA, then raises a hardware <span class="kw">IRQ</span>.</p>
<p>At high packet rates, constant interrupts overwhelm the CPU. Linux uses <span class="kw">NAPI</span>: after the first interrupt, further NIC interrupts are disabled and the kernel polls the ring buffer in a loop, processing many packets per cycle. Only when the ring empties does it re-enable interrupts.</p>`,
      chips:[
        {label:'NIC Ring Buffer',val:'Circular buffer in kernel RAM. NIC DMA-writes arriving packets here. Kernel reads via NAPI poll. Overflow = packet drop.'},
        {label:'RSS — Receive Side Scaling',val:'NIC hashes flows to different queues, each handled by a different CPU core. Distributes packet processing load across all cores.'},
        {label:'Checksum Offload',val:'Modern NICs compute TCP/IP checksums in hardware, saving significant CPU cycles per packet.'},
        {label:'TSO / GSO',val:'TCP Segmentation Offload: kernel hands one large buffer to NIC; NIC splits into MTU-sized packets. Reduces per-packet CPU overhead.'},
        {label:'XDP (eXpress Data Path)',val:'Run eBPF programs directly in the NIC driver, before the full network stack. Near-wire-speed packet filtering and forwarding.'},
        {label:'ethtool',val:'Primary NIC configuration tool: driver info, link speed, offload features, ring buffer sizes, statistics.'}
      ],
      code:`<span class="cc"># NIC driver and bus info</span>
ethtool -i eth0
<span class="cc"># driver: e1000e   bus-info: 0000:00:19.0</span>

<span class="cc"># Link speed and duplex</span>
ethtool eth0
<span class="cc"># Speed: 1000Mb/s  Duplex: Full  Link detected: yes</span>

<span class="cc"># NIC offload features</span>
ethtool -k eth0 | grep -E "checksum|segmentation"

<span class="cc"># NIC ring buffer sizes</span>
ethtool -g eth0
<span class="cc"># RX: 256  TX: 256 (current entries)</span>

<span class="cc"># Increase ring buffer (reduces drops at high pps)</span>
sudo ethtool -G eth0 rx 4096 tx 4096

<span class="cc"># Per-queue IRQ to CPU assignment</span>
cat /proc/interrupts | grep eth0`
    },
    {
      title:'The Linux Network Stack — Packet Path',
      body:`<p>A received packet traverses the entire Linux network stack from NIC to application. Here is the complete path:</p>
<div class="diagram">
  <div class="diagram-title">Packet Receive Path — NIC to Application</div>
  <div class="stack-item stack-active">🔩 NIC: DMA packet to ring buffer → raise IRQ</div>
  <div class="stack-arrow">↓ NAPI poll</div>
  <div class="stack-item stack-active">🔌 Driver: convert DMA buffer to sk_buff struct</div>
  <div class="stack-arrow">↓ netif_receive_skb()</div>
  <div class="stack-item stack-active">🔥 Netfilter/iptables/nftables: PREROUTING chain (firewall hooks)</div>
  <div class="stack-arrow">↓ ip_rcv()</div>
  <div class="stack-item stack-active">🌐 IP Layer: routing lookup, TTL decrement, fragment reassembly</div>
  <div class="stack-arrow">↓ tcp_v4_rcv()</div>
  <div class="stack-item stack-active">📡 TCP Layer: sequence numbers, ACKs, flow/congestion control</div>
  <div class="stack-arrow">↓ copy to socket receive buffer</div>
  <div class="stack-item stack-active">📬 Socket Buffer: app calls recv() → data copied to user space</div>
</div>`,
      chips:[
        {label:'sk_buff',val:'The kernel\'s socket buffer struct — contains packet data, metadata (timestamps, checksums, routing info), and linked-list pointers. Lives in kernel memory.'},
        {label:'Netfilter Hooks',val:'5 hook points in the packet path (PREROUTING, INPUT, FORWARD, OUTPUT, POSTROUTING). iptables/nftables attach rules here.'},
        {label:'Routing Table',val:'Kernel consults routing table at IP layer to decide: deliver locally (INPUT) or forward to another interface (FORWARD).'},
        {label:'TCP Congestion Control',val:'Algorithms (CUBIC default, BBR optional) control send rate to avoid overloading the network. Check: sysctl net.ipv4.tcp_congestion_control'},
        {label:'Zero-copy sendfile()',val:'sendfile() syscall sends file data directly from page cache to socket — no copy to user space. Used by Nginx/Apache for file serving.'},
        {label:'eBPF in networking',val:'Attach custom programs to socket, TC, XDP hooks. Used by Kubernetes (Cilium CNI), load balancers, and firewalls for high-performance policy.'}
      ]
    },
    {
      title:'Socket Buffers & TCP Tuning',
      body:`<p>The kernel maintains <span class="kw">send and receive buffers</span> for every TCP connection in RAM. These decouple application speed from network speed. Buffer size limits <strong>TCP window size</strong> — which caps throughput on high-latency links.</p>
<p>The bandwidth-delay product rule: optimal buffer size = bandwidth × RTT. For a 10 Gbps link with 100 ms RTT: 10 Gbps × 0.1 s = 1 GB buffer. Linux's autotuning adjusts buffers automatically within configured limits.</p>`,
      code:`<span class="cc"># Default socket buffer sizes</span>
sysctl net.core.rmem_default   <span class="cc"># default receive: 212992 (208 KB)</span>
sysctl net.ipv4.tcp_rmem       <span class="cc"># TCP range: min default max</span>

<span class="cc"># Tune for 10 Gbps WAN (high bandwidth × high latency)</span>
sudo sysctl net.core.rmem_max=134217728
sudo sysctl net.ipv4.tcp_rmem="4096 87380 134217728"

<span class="cc"># Live socket stats</span>
ss -s
<span class="cc"># TCP: estab 23, closed 1, timewait 4</span>

<span class="cc"># Per-connection buffer and retransmit info</span>
ss -tipm

<span class="cc"># Network interface stats (errors, drops)</span>
ip -s link show eth0

<span class="cc"># TCP retransmits and errors</span>
netstat -s | grep -E "retransmit|failed|reset"`
    },
    {
      title:'Netfilter, iptables & nftables',
      body:`<p><span class="kw">Netfilter</span> is the kernel's packet filtering framework — the foundation of Linux firewalling, NAT, and packet mangling. <code>iptables</code> (legacy) and <code>nftables</code> (modern) are userspace tools that configure Netfilter rules.</p>`,
      chips:[
        {label:'Tables',val:'filter (block/allow), nat (address translation), mangle (modify headers), raw (skip conntrack). Each has chains.'},
        {label:'Chains',val:'PREROUTING, INPUT, FORWARD, OUTPUT, POSTROUTING. Rules in a chain are evaluated top-to-bottom until a match.'},
        {label:'Conntrack',val:'Connection tracking: kernel remembers TCP state (ESTABLISHED, RELATED). Enables stateful firewalling. /proc/net/nf_conntrack.'},
        {label:'nftables',val:'Modern replacement for iptables. One tool for all tables, better performance, atomic rule updates. systemd and Docker both use nftables now.'},
        {label:'ufw / firewalld',val:'Higher-level frontends: ufw (Ubuntu), firewalld (RHEL/Fedora). Both generate iptables/nftables rules underneath.'},
        {label:'eBPF XDP firewall',val:'Bypass Netfilter entirely for maximum performance. XDP programs run in driver context — millions of pps possible.'}
      ],
      code:`<span class="cc"># List current iptables rules</span>
sudo iptables -L -n -v

<span class="cc"># Allow SSH, block everything else (simple firewall)</span>
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
sudo iptables -P INPUT DROP

<span class="cc"># View connection tracking table</span>
cat /proc/net/nf_conntrack | head -5
<span class="cc"># tcp   ESTABLISHED src=192.168.1.5 dst=8.8.8.8 ...</span>

<span class="cc"># Modern nftables equivalent</span>
sudo nft list ruleset

<span class="cc"># UFW (Ubuntu friendly frontend)</span>
sudo ufw status
sudo ufw allow 22/tcp`
    },
    {
      title:'Network Performance Monitoring',
      body:`<p>Understanding network bottlenecks requires visibility into the kernel's NIC queues, socket buffers, and TCP state. Linux exposes everything through <code>/proc/net</code>, <code>/sys/class/net</code>, and tools like <code>ss</code> and <code>tc</code>.</p>`,
      code:`<span class="cc"># Live per-interface stats: bandwidth, errors, drops</span>
watch -n1 "ip -s link show eth0"

<span class="cc"># Detailed NIC queue statistics</span>
ethtool -S eth0 | grep -E "drop|miss|error"

<span class="cc"># TCP socket details: state, send/recv queue, timer</span>
ss -ntpe

<span class="cc"># Check if NIC ring buffer is overflowing (RX drops)</span>
ethtool -S eth0 | grep rx_drops
<span class="cc"># If >0 and rising: increase ring buffer size</span>

<span class="cc"># Traffic shaping / QoS with tc</span>
tc qdisc show dev eth0
<span class="cc"># qdisc mq 0: root  (multi-queue, NVMe-style)</span>

<span class="cc"># Current TCP congestion control algorithm</span>
sysctl net.ipv4.tcp_congestion_control
<span class="cc"># cubic (default) or bbr (better for high-BDP links)</span>

<span class="cc"># Enable BBR (Google's TCP congestion algorithm)</span>
sudo sysctl net.core.default_qdisc=fq
sudo sysctl net.ipv4.tcp_congestion_control=bbr`
    }
  ],
  quiz:[
    {q:'What is NAPI and why does Linux use it for high-speed network cards?',opts:['A new API for socket programming replacing BSD sockets','A polling mechanism that batches packet processing after the first interrupt, avoiding interrupt-per-packet overhead at high packet rates','A kernel module providing hardware-accelerated encryption','A virtual network driver for container networking'],ans:1,hint:'At 10 Gbps+, millions of packets per second arrive. One interrupt per packet would overwhelm the CPU. NAPI fires one interrupt, then polls the ring buffer in a loop, processing many packets per CPU cycle.'},
    {q:'In the Linux network stack, what is an sk_buff?',opts:['A user-space socket buffer allocated by the application','The kernel struct wrapping a packet — contains data, metadata, and linked-list pointers — passed through every layer of the stack','A NIC hardware DMA descriptor ring entry','A Netfilter connection tracking entry'],ans:1,hint:'sk_buff (socket buffer) is the fundamental packet container in the kernel. It\'s allocated when a packet arrives, passed through driver → IP → TCP layers, and eventually data is copied to the application\'s socket receive buffer.'},
    {q:'What is the purpose of TCP socket receive buffers in the kernel?',opts:['They store kernel routing tables','They cache recent DNS lookups','They decouple application reading speed from network arrival speed, and their size limits the TCP receive window, capping throughput on high-latency links','They hold compressed packet headers to reduce memory usage'],ans:2,hint:'TCP window = how much data the receiver can accept before requiring acknowledgment. Window size is bounded by receive buffer. On a 1 Gbps × 100 ms link, you need 12.5 MB of buffer to saturate the link.'},
    {q:'What does Netfilter\'s conntrack (connection tracking) module do?',opts:['Tracks the physical location of network cables','Remembers TCP/UDP connection state (NEW, ESTABLISHED, RELATED) enabling stateful firewall rules that automatically allow return traffic','Monitors bandwidth usage per connection for billing','Routes packets based on connection history'],ans:1,hint:'Conntrack is what makes "ESTABLISHED,RELATED" iptables rules work. The kernel remembers you initiated a TCP connection, so return packets are automatically allowed without an explicit inbound rule.'},
    {q:'What advantage does the "none" XDP fast-path provide over normal Netfilter/iptables processing?',opts:['XDP applies rules after TCP processing for better accuracy','XDP eBPF programs run directly in the NIC driver context — before the full kernel network stack — enabling near-wire-speed packet processing impossible with iptables','XDP only works for UDP, not TCP','XDP is a userspace library that avoids kernel overhead entirely'],ans:1,hint:'XDP (eXpress Data Path) runs eBPF programs at the earliest possible point — in the driver, when the packet is still in the NIC ring buffer. This bypasses conntrack, Netfilter, and all stack overhead. Used by Cilium, Cloudflare, Facebook DPDK alternatives.'}
  ]
},

// ─── PART 5: THE COMPLETE HARDWARE PICTURE ────────────────────────
{
  id:'hw-complete', num:'25',
  title:'The Complete Hardware Picture',
  subtitle:'Bringing it all together — how CPU, memory, storage, and networking interact through the kernel\'s hardware abstraction layers, and how to see it all live on your system.',
  sections:[
    {
      title:'How the Hardware Layers Connect',
      body:`<p>Everything we\'ve studied in Module 5 connects through the kernel. Let\'s trace a complete, realistic scenario: <strong>your browser requests a web page, receives data, and renders it</strong>. Every layer of the hardware stack participates:</p>
<ol>
<li><strong>CPU</strong> — executes the browser process (Ring 3). TLB caches its page table entries. L1/L2 caches hold hot code and data.</li>
<li><strong>Memory (MMU)</strong> — browser\'s heap pages are mapped via page tables. New allocations trigger minor page faults (kernel maps anonymous pages on demand).</li>
<li><strong>NIC → Network Stack</strong> — TCP SYN sent via write() → socket buffer → IP layer → NIC DMA → wire. Server\'s TCP ACK arrives: NIC DMA → ring buffer → NAPI poll → IP → TCP → socket receive buffer → browser\'s recv().</li>
<li><strong>Storage → Filesystem</strong> — Browser checks disk cache: open() → VFS → ext4 → page cache lookup. If page cache hit → served from RAM in µs. Cache miss → NVMe I/O → DMA to page cache → copy to user space.</li>
<li><strong>GPU (MMIO)</strong> — Rendering engine calls into the GPU driver which writes commands to GPU registers via MMIO → GPU renders pixels to framebuffer → compositor (Wayland/DRM/KMS) scans framebuffer to display.</li>
</ol>`,
      chips:[
        {label:'PCIe — The Hardware Bus',val:'NVMe, NIC, and GPU all connect via PCIe lanes directly to the CPU\'s root complex. PCIe 4.0 x16 = 32 GB/s bidirectional bandwidth.'},
        {label:'DMA — Everything Uses It',val:'NIC, NVMe, and GPU all write data directly to RAM via DMA, raising interrupts when done. CPU is freed to do other work during transfers.'},
        {label:'Interrupts → Kernel',val:'Every hardware event (NIC packet, NVMe completion, timer tick, keyboard key) raises an IRQ, preempting current execution to run the kernel interrupt handler.'},
        {label:'Memory Pressure Cascade',val:'Under low memory: page reclaim evicts file cache → more disk I/O → slower filesystem → more CPU wait → slower everything. Memory is the central resource.'},
        {label:'IOMMU',val:'Like the CPU MMU but for DMA — maps device virtual addresses to physical RAM. Prevents buggy/malicious device DMA from corrupting kernel memory.'},
        {label:'Power Management',val:'CPU C-states, PCIe ASPM, disk spindown, and NIC wake-on-LAN are all coordinated by the kernel\'s PM subsystem to balance performance and power.'}
      ]
    },
    {
      title:'PCIe — The Hardware Bus',
      body:`<p>Almost everything modern connects through <span class="kw">PCIe (PCI Express)</span>: GPUs, NVMe SSDs, NICs, USB controllers, SATA controllers, and Thunderbolt. Understanding PCIe explains device performance limits and how the kernel sees hardware.</p>
<p>PCIe uses point-to-point serial lanes. Devices are assigned <strong>BARs (Base Address Registers)</strong> — physical address ranges mapped into the CPU's address space. The kernel accesses device registers by reading/writing these physical addresses (MMIO). DMA transfers happen in the opposite direction: the device writes to kernel RAM.</p>`,
      code:`<span class="cc"># List all PCIe devices</span>
lspci
<span class="cc"># 00:1f.2 SATA controller: Intel ...</span>
<span class="cc"># 01:00.0 VGA: NVIDIA ...</span>
<span class="cc"># 02:00.0 Ethernet: Intel I225-V</span>
<span class="cc"># 03:00.0 NVMe: Samsung 980 Pro</span>

<span class="cc"># Verbose device info (speed, width, capability)</span>
sudo lspci -vvv -s 03:00.0 | grep -E "Speed|Width|LnkSta"
<span class="cc"># LnkSta: Speed 16GT/s (PCIe 4.0), Width x4</span>
<span class="cc"># Maximum bandwidth: 4 lanes × 4 GB/s = ~16 GB/s</span>

<span class="cc"># PCIe device driver binding</span>
ls /sys/bus/pci/devices/0000:03:00.0/
<span class="cc"># driver → ../../../../bus/pci/drivers/nvme</span>

<span class="cc"># IOMMU groups (device isolation for virtualization)</span>
find /sys/kernel/iommu_groups -type l | sort -V`
    },
    {
      title:'Observing Hardware Live with /sys and /proc',
      body:`<p>The Linux kernel exposes comprehensive live hardware state through two virtual filesystems:</p>
<ul>
<li><code>/proc</code> — Process and kernel statistics (CPU, memory, networking, filesystem stats). Existed since early Linux.</li>
<li><code>/sys</code> (sysfs) — Structured device tree. Every device, driver, and bus is represented here as a directory tree. Used to configure hardware at runtime.</li>
</ul>
<p>These are not real files — they\'re kernel data structures presented as a filesystem interface. Reading them always returns the current live value.</p>`,
      code:`<span class="cc"># ── CPU ──────────────────────────────────────────</span>
cat /proc/cpuinfo                <span class="cc"># per-core details</span>
cat /proc/stat                   <span class="cc"># CPU time: user sys idle iowait irq</span>
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq

<span class="cc"># ── Memory ───────────────────────────────────────</span>
cat /proc/meminfo                <span class="cc"># full memory breakdown</span>
cat /proc/vmstat                 <span class="cc"># page faults, swapins, TLB flushes</span>
cat /proc/slabinfo               <span class="cc"># kernel object cache sizes</span>

<span class="cc"># ── Storage ──────────────────────────────────────</span>
cat /proc/diskstats              <span class="cc"># I/O stats per device</span>
cat /sys/block/nvme0n1/queue/scheduler
cat /sys/block/nvme0n1/stat      <span class="cc"># live queue depth, latency</span>

<span class="cc"># ── Networking ───────────────────────────────────</span>
cat /proc/net/dev                <span class="cc"># per-interface: bytes/packets/errors</span>
cat /proc/net/tcp                <span class="cc"># all TCP sockets with state and buffers</span>
cat /sys/class/net/eth0/speed    <span class="cc"># link speed in Mbps</span>

<span class="cc"># ── Hardware devices ─────────────────────────────</span>
cat /proc/interrupts             <span class="cc"># IRQ counts per CPU per device</span>
cat /proc/iomem                  <span class="cc"># physical memory map (MMIO regions)</span>
cat /proc/ioports                <span class="cc"># I/O port assignments (legacy x86)</span>`
    },
    {
      title:'Performance Profiling Across All Layers',
      body:`<p>Linux performance tools can observe the entire hardware stack simultaneously. <span class="kw">perf</span>, <span class="kw">BPF/bpftrace</span>, and <span class="kw">ftrace</span> are the professional-grade tools used by kernel developers and sysadmins to diagnose bottlenecks at any layer.</p>`,
      code:`<span class="cc"># ── System-wide hardware counters ────────────────</span>
perf stat -a sleep 5
<span class="cc"># cycles, instructions, cache-misses, page-faults,</span>
<span class="cc"># context-switches, cpu-migrations, branch-misses</span>

<span class="cc"># ── CPU hotspot profiling ─────────────────────────</span>
sudo perf top
<span class="cc"># Shows which functions consume most CPU cycles</span>
<span class="cc"># including kernel functions!</span>

<span class="cc"># ── Cache miss analysis ───────────────────────────</span>
perf stat -e L1-dcache-misses,LLC-load-misses ./program

<span class="cc"># ── Tracing syscalls with strace ──────────────────</span>
strace -c -p 1234
<span class="cc"># Summarizes syscalls by count and time</span>

<span class="cc"># ── bpftrace: hardware latency distribution ───────</span>
sudo bpftrace -e 'tracepoint:block:block_rq_complete
  { @lat_us = hist((nsecs - args->sector) / 1000); }'

<span class="cc"># ── Full system overview ──────────────────────────</span>
vmstat 1    <span class="cc"># CPU: r b swpd free, I/O: bi bo, CPU: us sy id wa</span>
            <span class="cc"># r = run queue, b = blocked on I/O, wa = iowait%</span>`
    },
    {
      title:'Module 5 — Complete Summary',
      body:`<p>You have now learned how every piece of hardware in a Linux system works — and how the kernel manages it. Let\'s consolidate the complete picture:</p>
<div class="diagram">
  <div class="diagram-title">The Complete Linux Hardware Stack — Module 5</div>
  <div class="stack-item stack-active">🖥️ Module 1: UI Layer — Applications, Desktop Environment, Window System</div>
  <div class="stack-arrow">↕ syscalls</div>
  <div class="stack-item stack-active">⚙️ Module 2: System Services — systemd, journald, udev, networking</div>
  <div class="stack-arrow">↕ commands & tools</div>
  <div class="stack-item stack-active">🗂️ Module 3: Linux Commands — files, text, processes, permissions, networking</div>
  <div class="stack-arrow">↕ kernel subsystems</div>
  <div class="stack-item stack-active">📜 Module 4: Linux Kernel — scheduler, memory, VFS, TCP/IP, drivers</div>
  <div class="stack-arrow">↕ hardware abstraction (device drivers, DMA, IRQ, MMIO)</div>
  <div class="stack-item stack-active">🔩 Module 5: Hardware — CPU rings/caches/power, DRAM/paging/swap, NVMe/filesystems, NIC/TCP stack</div>
  <div class="stack-arrow">↕</div>
  <div class="stack-item stack-dim">⚡ Physical Silicon — transistors, capacitors, optical fiber</div>
</div>
<p style="margin-top:18px"><strong>What you now understand:</strong> When you open a browser and type a URL, you can trace the entire path — from the keystroke's IRQ through the kernel scheduler, the DNS UDP packet through the NIC ring buffer and TCP stack, the HTTP response DMA'd to RAM, the TLS decryption in CPU caches, the rendered pixels through the GPU driver and DRM/KMS to your display. Every layer, every mechanism, every kernel subsystem — you understand why it exists and how it works.</p>`,
      chips:[
        {label:'CPU',val:'Fetch-decode-execute. Ring 0/3 privilege. L1/L2/L3 caches. P-states (frequency). C-states (sleep). NUMA topology.'},
        {label:'Memory',val:'DRAM pages. Virtual memory + MMU. 4-level page tables. TLB. Demand paging. CoW. OOM killer. Swap. SLUB allocator.'},
        {label:'Storage',val:'HDD vs SSD vs NVMe. Block I/O stack. Page cache. fsync. I/O schedulers. ext4/XFS/Btrfs inodes. iostat/iotop.'},
        {label:'Networking',val:'NIC DMA + NAPI. sk_buff through IP/TCP. Socket buffers = window size. Netfilter/conntrack. XDP eBPF.'},
        {label:'PCIe Bus',val:'Everything connects via PCIe. BARs = MMIO device registers. DMA = device writes to RAM. IOMMU = protection.'},
        {label:'/sys + /proc',val:'Every hardware detail is live-readable. These virtual filesystems expose the kernel\'s view of all hardware in real time.'}
      ]
    }
  ],
  quiz:[
    {q:'When a web browser receives a TCP packet from the network, through which kernel structures does the data travel before reaching the application?',opts:['File cache → page table → user buffer','NIC ring buffer → sk_buff → IP layer → TCP layer → socket receive buffer → user space via recv()','TLB → page fault handler → slab allocator → user buffer','IRQ table → process scheduler → VFS → user buffer'],ans:1,hint:'The full path: NIC DMA to ring buffer → NAPI poll → sk_buff allocated → IP routing → TCP sequence checking → copied to socket receive buffer → application calls recv() → data copied to user space.'},
    {q:'What is the role of the IOMMU in hardware security?',opts:['It manages TLB flushes during context switches','It prevents device DMA from writing to arbitrary physical memory — isolating device memory access like the MMU isolates process memory access','It controls PCIe link speed and power state','It manages cache coherency between CPU sockets on NUMA systems'],ans:1,hint:'The MMU protects processes from each other. The IOMMU does the same for DMA-capable devices — without it, a buggy NIC firmware could DMA-write anywhere in physical RAM, corrupting the kernel.'},
    {q:'What does a high "wa" (iowait) percentage in vmstat/top indicate?',opts:['The CPU is spending a lot of time in kernel mode','CPUs are idle waiting for I/O operations to complete — typically disk I/O or network I/O — indicating a storage or network bottleneck','The system is thrashing between C-states','Excessive interrupt handling is consuming CPU time'],ans:1,hint:'iowait = CPU is idle but cannot proceed because it\'s waiting for I/O (usually disk). High iowait means storage is the bottleneck — either slow device, full queue, or excessive random I/O causing HDD seek storms.'},
    {q:'You check /proc/net/dev and see rising RX drop counts on eth0. What is the most likely cause and fix?',opts:['The NIC cable is damaged — replace hardware','The NIC ring buffer is overflowing before NAPI can process packets — fix by increasing ring buffer size with ethtool -G','iptables is dropping the packets — add an ACCEPT rule','The TCP receive buffer is full — increase net.core.rmem_max'],ans:1,hint:'RX drops at the NIC level (before the kernel even sees the packet) are almost always ring buffer overflow. The NIC is receiving faster than NAPI can drain. Solution: increase ring buffer depth. If already maxed, you need more CPU cores or RSS tuning.'},
    {q:'Completing all 5 modules, what is the correct order of the Linux stack from hardware to user?',opts:['Kernel → Hardware → System Services → Commands → UI Layer','Hardware → Kernel → System Services → Commands → UI Layer','System Services → Kernel → Hardware → UI Layer → Commands','UI Layer → Commands → System Services → Kernel → Hardware (top-down user perspective)'],ans:1,hint:'Bottom-up: Hardware silicon → Kernel manages hardware → System services (systemd/udev) built on kernel → Commands and tools built on services → UI applications at the top. Each layer depends entirely on all layers below it.'}
  ]
}

];

MODULE5.forEach(t => { t.module = 5; });

const ALL_TOPICS = [...MODULE1, ...MODULE2, ...MODULE3, ...MODULE4, ...MODULE5];
let appState = { currentTopic: null, showQuiz: false, topicData: {} };
let quizSession = null;

try {
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) { const p = JSON.parse(saved); appState = {...appState,...p,topicData:{...appState.topicData,...(p.topicData||{})}}; }
} catch(e) {}

function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(appState)); } catch(e) {} }
function td(id) { if (!appState.topicData[id]) appState.topicData[id]={attempts:0,passed:false,score:0}; return appState.topicData[id]; }

function isUnlocked(idx) {
  if (idx === 0) return true;
  const topic = ALL_TOPICS[idx];
  if (topic.module === 2 && ALL_TOPICS[idx-1].module === 1) return MODULE1.every(t => td(t.id).passed);
  if (topic.module === 3 && ALL_TOPICS[idx-1].module === 2) return MODULE2.every(t => td(t.id).passed);
  if (topic.module === 4 && ALL_TOPICS[idx-1].module === 3) return MODULE3.every(t => td(t.id).passed);
  if (topic.module === 5 && ALL_TOPICS[idx-1].module === 4) return MODULE4.every(t => td(t.id).passed);
  return td(ALL_TOPICS[idx-1].id).passed;
}

function isModule2Unlocked() { return MODULE1.every(t => td(t.id).passed); }
function isModule3Unlocked() { return MODULE2.every(t => td(t.id).passed); }
function isModule4Unlocked() { return MODULE3.every(t => td(t.id).passed); }
function isModule5Unlocked() { return MODULE4.every(t => td(t.id).passed); }

function getProgress() {
  const passed = ALL_TOPICS.filter(t => td(t.id).passed).length;
  return { passed, total: ALL_TOPICS.length, pct: Math.round(passed / ALL_TOPICS.length * 100) };
}

function getModuleProgress(mod) {
  const topics = mod === 1 ? MODULE1 : mod === 2 ? MODULE2 : mod === 3 ? MODULE3 : mod === 4 ? MODULE4 : MODULE5;
  const passed = topics.filter(t => td(t.id).passed).length;
  return { passed, total: topics.length, pct: Math.round(passed / topics.length * 100) };
}

// ═══════════════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════════════
function renderSidebar() {
  const prog = getProgress();
  document.getElementById('sb-fill').style.width = prog.pct + '%';
  document.getElementById('sb-pct').textContent = prog.pct + '%';
  document.getElementById('prog-fill').style.width = prog.pct + '%';
  document.getElementById('prog-text').textContent = `${prog.passed} / ${prog.total} topics`;

  const m2locked = !isModule2Unlocked();
  const m3locked = !isModule3Unlocked();
  const m4locked = !isModule4Unlocked();
  const m1prog = getModuleProgress(1);
  const m2prog = getModuleProgress(2);
  const m3prog = getModuleProgress(3);
  const m4prog = getModuleProgress(4);
  const m5prog = getModuleProgress(5);

  let html = '';

  // Module 1 header
  html += `<div class="sidebar-module-header">
    <div class="mod-badge">M1</div>
    <div class="mod-header-text"><b>Module 1</b> UI Layer &nbsp;·&nbsp; ${m1prog.passed}/${m1prog.total}</div>
  </div>`;

  MODULE1.forEach((t, i) => {
    const globalIdx = i;
    const locked = !isUnlocked(globalIdx);
    const data = td(t.id);
    const active = appState.currentTopic === t.id;
    const dotClass = data.passed ? 'nav-dot-done' : active ? 'nav-dot-active' : locked ? 'nav-dot-locked' : 'nav-dot-default';
    const dotContent = data.passed ? '✓' : t.num;
    const itemClass = ['nav-item', active ? 'nav-active' : '', locked ? 'nav-locked' : '', data.passed ? 'nav-done' : ''].filter(Boolean).join(' ');
    const subStatus = data.passed ? 'Completed ✓' : active ? 'In Progress' : locked ? 'Locked' : 'Not started';
    const rightIcon = locked ? `<span class="nav-right-icon">🔒</span>` : '';
    const click = locked ? '' : `onclick="selectTopic('${t.id}')"`;
    html += `<div class="${itemClass}" ${click}>
      <div class="nav-dot ${dotClass}">${dotContent}</div>
      <div class="nav-label-group">
        <span class="nav-title">${t.title}</span>
        <span class="nav-sub-status">${subStatus}</span>
      </div>${rightIcon}
    </div>`;
  });

  // Module 2 header
  html += `<div class="sidebar-module-header">
    <div class="mod-badge mod2">M2</div>
    <div class="mod-header-text"><b class="t2">Module 2</b> System Services &nbsp;·&nbsp; ${m2prog.passed}/${m2prog.total}</div>
  </div>`;

  if (m2locked) {
    const remaining = MODULE1.filter(t => !td(t.id).passed).length;
    html += `<div class="module-locked-banner">
      <div class="mlb-icon">🔒</div>
      <div class="mlb-text"><b>Module 2 Locked</b>Complete all ${remaining} remaining Module 1 quiz${remaining === 1 ? '' : 'zes'} to unlock.</div>
    </div>`;
  }

  MODULE2.forEach((t, i) => {
    const globalIdx = MODULE1.length + i;
    const locked = !isUnlocked(globalIdx);
    const data = td(t.id);
    const active = appState.currentTopic === t.id;
    const isM2Active = active && !locked;
    const dotClass = data.passed ? 'nav-dot-done' : isM2Active ? 'nav-dot-active' : locked ? 'nav-dot-locked' : 'nav-dot-default';
    const dotContent = data.passed ? '✓' : t.num;
    const baseClass = 'nav-item';
    const activeClass = isM2Active ? 'm2-active' : '';
    const lockedClass = locked ? 'nav-locked' : '';
    const doneClass = data.passed ? 'm2-done' : '';
    const itemClass = [baseClass, activeClass, lockedClass, doneClass].filter(Boolean).join(' ');
    const subStatus = data.passed ? 'Completed ✓' : isM2Active ? 'In Progress' : locked ? 'Locked' : 'Not started';
    const rightIcon = locked ? `<span class="nav-right-icon">🔒</span>` : '';
    const click = locked ? '' : `onclick="selectTopic('${t.id}')"`;
    html += `<div class="${itemClass}" ${click}>
      <div class="nav-dot ${dotClass}">${dotContent}</div>
      <div class="nav-label-group">
        <span class="nav-title">${t.title}</span>
        <span class="nav-sub-status">${subStatus}</span>
      </div>${rightIcon}
    </div>`;
  });

  // Module 3 header
  html += `<div class="sidebar-module-header">
    <div class="mod-badge mod3">M3</div>
    <div class="mod-header-text"><b class="t3">Module 3</b> Linux Commands &nbsp;·&nbsp; ${m3prog.passed}/${m3prog.total}</div>
  </div>`;

  if (m3locked) {
    const remaining = MODULE2.filter(t => !td(t.id).passed).length;
    html += `<div class="module-locked-banner">
      <div class="mlb-icon">🔒</div>
      <div class="mlb-text"><b>Module 3 Locked</b>Complete all ${remaining} remaining Module 2 quiz${remaining === 1 ? '' : 'zes'} to unlock.</div>
    </div>`;
  }

  MODULE3.forEach((t, i) => {
    const globalIdx = MODULE1.length + MODULE2.length + i;
    const locked = !isUnlocked(globalIdx);
    const data = td(t.id);
    const active = appState.currentTopic === t.id;
    const isM3Active = active && !locked;
    const dotClass = data.passed ? 'nav-dot-done' : isM3Active ? 'nav-dot-active' : locked ? 'nav-dot-locked' : 'nav-dot-default';
    const dotContent = data.passed ? '✓' : t.num;
    const baseClass = 'nav-item';
    const activeClass = isM3Active ? 'm3-active' : '';
    const lockedClass = locked ? 'nav-locked' : '';
    const doneClass = data.passed ? 'm3-done' : '';
    const itemClass = [baseClass, activeClass, lockedClass, doneClass].filter(Boolean).join(' ');
    const subStatus = data.passed ? 'Completed ✓' : isM3Active ? 'In Progress' : locked ? 'Locked' : 'Not started';
    const rightIcon = locked ? `<span class="nav-right-icon">🔒</span>` : '';
    const click = locked ? '' : `onclick="selectTopic('${t.id}')"`;
    html += `<div class="${itemClass}" ${click}>
      <div class="nav-dot ${dotClass}">${dotContent}</div>
      <div class="nav-label-group">
        <span class="nav-title">${t.title}</span>
        <span class="nav-sub-status">${subStatus}</span>
      </div>${rightIcon}
    </div>`;
  });

  // Module 4 header
  html += `<div class="sidebar-module-header">
    <div class="mod-badge mod4">M4</div>
    <div class="mod-header-text"><b class="t4">Module 4</b> Linux Kernel &nbsp;·&nbsp; ${m4prog.passed}/${m4prog.total}</div>
  </div>`;

  if (m4locked) {
    const remaining = MODULE3.filter(t => !td(t.id).passed).length;
    html += `<div class="module-locked-banner">
      <div class="mlb-icon">🔒</div>
      <div class="mlb-text"><b>Module 4 Locked</b>Complete all ${remaining} remaining Module 3 quiz${remaining === 1 ? '' : 'zes'} to unlock.</div>
    </div>`;
  }

  MODULE4.forEach((t, i) => {
    const globalIdx = MODULE1.length + MODULE2.length + MODULE3.length + i;
    const locked = !isUnlocked(globalIdx);
    const data = td(t.id);
    const active = appState.currentTopic === t.id;
    const isM4Active = active && !locked;
    const dotClass = data.passed ? 'nav-dot-done' : isM4Active ? 'nav-dot-active' : locked ? 'nav-dot-locked' : 'nav-dot-default';
    const dotContent = data.passed ? '✓' : t.num;
    const itemClass = ['nav-item', isM4Active ? 'm4-active' : '', locked ? 'nav-locked' : '', data.passed ? 'm4-done' : ''].filter(Boolean).join(' ');
    const subStatus = data.passed ? 'Completed ✓' : isM4Active ? 'In Progress' : locked ? 'Locked' : 'Not started';
    const rightIcon = locked ? `<span class="nav-right-icon">🔒</span>` : '';
    const click = locked ? '' : `onclick="selectTopic('${t.id}')"`;
    html += `<div class="${itemClass}" ${click}>
      <div class="nav-dot ${dotClass}">${dotContent}</div>
      <div class="nav-label-group">
        <span class="nav-title">${t.title}</span>
        <span class="nav-sub-status">${subStatus}</span>
      </div>${rightIcon}
    </div>`;
  });

  // Module 5 header
  const m5locked = !isModule5Unlocked();
  html += `<div class="sidebar-module-header">
    <div class="mod-badge mod5">M5</div>
    <div class="mod-header-text"><b class="t5">Module 5</b> Hardware Layer &nbsp;·&nbsp; ${m5prog.passed}/${m5prog.total}</div>
  </div>`;

  if (m5locked) {
    const remaining = MODULE4.filter(t => !td(t.id).passed).length;
    html += `<div class="module-locked-banner">
      <div class="mlb-icon">🔒</div>
      <div class="mlb-text"><b>Module 5 Locked</b>Complete all ${remaining} remaining Module 4 quiz${remaining === 1 ? '' : 'zes'} to unlock.</div>
    </div>`;
  }

  MODULE5.forEach((t, i) => {
    const globalIdx = MODULE1.length + MODULE2.length + MODULE3.length + MODULE4.length + i;
    const locked = !isUnlocked(globalIdx);
    const data = td(t.id);
    const active = appState.currentTopic === t.id;
    const isM5Active = active && !locked;
    const dotClass = data.passed ? 'nav-dot-done' : isM5Active ? 'nav-dot-active' : locked ? 'nav-dot-locked' : 'nav-dot-default';
    const dotContent = data.passed ? '✓' : t.num;
    const itemClass = ['nav-item', isM5Active ? 'm5-active' : '', locked ? 'nav-locked' : '', data.passed ? 'm5-done' : ''].filter(Boolean).join(' ');
    const subStatus = data.passed ? 'Completed ✓' : isM5Active ? 'In Progress' : locked ? 'Locked' : 'Not started';
    const rightIcon = locked ? `<span class="nav-right-icon">🔒</span>` : '';
    const click = locked ? '' : `onclick="selectTopic('${t.id}')"`;
    html += `<div class="${itemClass}" ${click}>
      <div class="nav-dot ${dotClass}">${dotContent}</div>
      <div class="nav-label-group">
        <span class="nav-title">${t.title}</span>
        <span class="nav-sub-status">${subStatus}</span>
      </div>${rightIcon}
    </div>`;
  });

  document.getElementById('nav-list').innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN RENDER
// ═══════════════════════════════════════════════════════════════════
function renderMain() {
  const area = document.getElementById('main-area');
  if (!appState.currentTopic) { renderWelcome(); return; }

  const idx = ALL_TOPICS.findIndex(t => t.id === appState.currentTopic);
  const topic = ALL_TOPICS[idx];

  if (!isUnlocked(idx)) {
    const isM2Block = topic.module === 2 && !isModule2Unlocked();
    const isM3Block = topic.module === 3 && !isModule3Unlocked();
    const isM4Block = topic.module === 4 && !isModule4Unlocked();
    const isM5Block = topic.module === 5 && !isModule5Unlocked();
    area.innerHTML = `<div class="locked-view fade-in">
      <div class="locked-icon">${isM5Block ? '🔩' : isM4Block ? '🐧' : isM3Block ? '🖥️' : isM2Block ? '📦' : '🔒'}</div>
      <div class="locked-h">${isM5Block ? 'Module 5 Locked' : isM4Block ? 'Module 4 Locked' : isM3Block ? 'Module 3 Locked' : isM2Block ? 'Module 2 Locked' : 'Topic Locked'}</div>
      <div class="locked-p">${isM5Block ? 'Complete all 5 parts of Module 4 to unlock Module 5 — Hardware Layer Deep Dive.' : isM4Block ? 'Complete all 5 parts of Module 3 to unlock Module 4 — The Linux Kernel.' : isM3Block ? 'Complete all 5 parts of Module 2 to unlock Module 3 — Linux Commands.' : isM2Block ? 'Complete all 5 parts of Module 1 to unlock Module 2 — System Services.' : "Complete the previous topic's quiz with 4 out of 5 correct to unlock this level."}</div>
    </div>`;
    return;
  }

  const data = td(topic.id);
  const modLabel = topic.module === 1 ? 'Module 1 — UI Layer' : topic.module === 2 ? 'Module 2 — System Services' : topic.module === 3 ? 'Module 3 — Linux Commands' : topic.module === 4 ? 'Module 4 — Linux Kernel' : 'Module 5 — Hardware Layer';
  const isM2 = topic.module === 2;
  const isM3 = topic.module === 3;
  const isM4 = topic.module === 4;
  const isM5 = topic.module === 5;

  let sectionsHtml = topic.sections.map(s => {
    let inner = `<div class="sc-body">${s.body || ''}</div>`;
    if (s.chips && s.chips.length) {
      inner += `<div class="chips-grid">${s.chips.map(c => `<div class="chip"><div class="chip-label">${c.label}</div><div class="chip-val">${c.val}</div></div>`).join('')}</div>`;
    }
    if (s.code) { inner += `<div class="code-block"><pre>${s.code}</pre></div>`; }
    return `<div class="section-card"><div class="sc-title"><div class="sc-title-pill" style="${isM4 ? 'background:linear-gradient(180deg,var(--cyan),#0ea5e9)' : isM2 ? 'background:linear-gradient(180deg,var(--teal),#0ea5e9)' : isM3 ? 'background:linear-gradient(180deg,var(--orange),#f59e0b)' : ''}"></div>${s.title}</div>${inner}</div>`;
  }).join('');

  const passBanner = data.passed ? `<div class="pass-banner"><div class="pass-banner-icon">🏆</div><div><div class="pass-banner-title">Topic Completed — ${data.score}% score</div><div class="pass-banner-sub">Review the content below or move to the next level.</div></div></div>` : '';

  const nextIdx = idx + 1;
  const hasNext = nextIdx < ALL_TOPICS.length;
  const nextTopic = hasNext ? ALL_TOPICS[nextIdx] : null;
  // Only show next button if next topic is unlocked
  const nextBtnHtml = data.passed && hasNext && isUnlocked(nextIdx) ? `<button class="btn-secondary" onclick="selectTopic('${nextTopic.id}')">Next: ${nextTopic.title} →</button>` : '';

  // Special: after completing M1 part 5, show M2 unlock message
  const isLastM1 = topic.module === 1 && idx === MODULE1.length - 1;
  const isLastM2 = topic.module === 2 && idx === MODULE1.length + MODULE2.length - 1;
  const isLastM3 = topic.module === 3 && idx === MODULE1.length + MODULE2.length + MODULE3.length - 1;
  const m1CompleteBanner = isLastM1 && data.passed ? `<div style="margin-top:16px;display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,var(--teal-lt),rgba(14,165,233,.08));border:1.5px solid rgba(13,148,136,.25);border-radius:14px;padding:14px 20px;"><div style="font-size:1.6rem">🎉</div><div><div style="font-size:.9rem;font-weight:700;color:var(--teal)">Module 1 Complete! Module 2 is now unlocked.</div><div style="font-size:.78rem;color:var(--teal);opacity:.75">System Services & systemd awaits you in the sidebar.</div></div></div>` : '';
  const m2CompleteBanner = isLastM2 && data.passed ? `<div style="margin-top:16px;display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,var(--orange-lt),rgba(245,158,11,.08));border:1.5px solid rgba(234,88,12,.25);border-radius:14px;padding:14px 20px;"><div style="font-size:1.6rem">🚀</div><div><div style="font-size:.9rem;font-weight:700;color:var(--orange)">Module 2 Complete! Module 3 is now unlocked.</div><div style="font-size:.78rem;color:var(--orange);opacity:.75">Linux Commands await — put it all into practice.</div></div></div>` : '';
  const isLastM4 = topic.module === 4 && idx === MODULE1.length + MODULE2.length + MODULE3.length + MODULE4.length - 1;
  const m3CompleteBanner = isLastM3 && data.passed ? `<div style="margin-top:16px;display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,var(--cyan-lt),rgba(14,165,233,.08));border:1.5px solid rgba(8,145,178,.25);border-radius:14px;padding:14px 20px;"><div style="font-size:1.6rem">⚡</div><div><div style="font-size:.9rem;font-weight:700;color:var(--cyan)">Module 3 Complete! Module 4 is now unlocked.</div><div style="font-size:.78rem;color:var(--cyan);opacity:.75">Linux Kernel — understand the core of your operating system.</div></div></div>` : '';
  const m4CompleteBanner = isLastM4 && data.passed ? `<div style="margin-top:16px;display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,#f5f3ff,rgba(124,58,237,.08));border:1.5px solid rgba(124,58,237,.25);border-radius:14px;padding:14px 20px;"><div style="font-size:1.6rem">🔩</div><div><div style="font-size:.9rem;font-weight:700;color:#7c3aed">Module 4 Complete! Module 5 — Hardware Layer is now unlocked.</div><div style="font-size:.78rem;color:#7c3aed;opacity:.75">Go deep into CPU, memory, storage and networking hardware.</div></div></div>` : '';

  const quizCtaStyle = isM5 ? 'background:linear-gradient(135deg,#f5f3ff,rgba(124,58,237,.06));border-color:rgba(124,58,237,.2)' : isM4 ? 'background:linear-gradient(135deg,var(--cyan-lt),rgba(14,165,233,.06));border-color:rgba(8,145,178,.2)' : isM3 ? 'background:linear-gradient(135deg,var(--orange-lt),rgba(245,158,11,.06));border-color:rgba(234,88,12,.2)' : isM2 ? 'background:linear-gradient(135deg,var(--teal-lt),rgba(14,165,233,.06));border-color:rgba(13,148,136,.2)' : '';
  const startBtnStyle = isM5 ? 'background:linear-gradient(135deg,#7c3aed,#a855f7)' : isM4 ? 'background:linear-gradient(135deg,var(--cyan),#0ea5e9)' : isM3 ? 'background:linear-gradient(135deg,var(--orange),#f59e0b)' : isM2 ? 'background:linear-gradient(135deg,var(--teal),#0ea5e9)' : '';

  area.innerHTML = `<div class="fade-in">
    <div class="topic-crumb"><span>${modLabel}</span><span class="crumb-sep">/</span><span>Part ${topic.num}</span></div>
    <h1 class="topic-h1">${topic.title}</h1>
    <p class="topic-sub">${topic.subtitle}</p>
    ${passBanner}
    ${m1CompleteBanner}
    ${m2CompleteBanner}
    ${m3CompleteBanner}
    ${m4CompleteBanner}
    ${sectionsHtml}
    <div class="quiz-cta" style="${quizCtaStyle}">
      <div>
        <div class="quiz-cta-title">${data.passed ? '✅ Quiz Completed' : '📝 Knowledge Check'}</div>
        <div class="quiz-cta-sub">${data.passed ? `You scored ${data.score}% · ${topic.quiz.length} questions` : `Answer 4 of 5 correctly to unlock the next part`}</div>
      </div>
      <div class="quiz-cta-btns">
        ${nextBtnHtml}
        ${data.passed ? `<button class="btn-retake" onclick="openQuiz()" style="${isM5 ? 'border-color:#7c3aed;color:#7c3aed' : isM4 ? 'border-color:var(--cyan);color:var(--cyan)' : isM3 ? 'border-color:var(--orange);color:var(--orange)' : isM2 ? 'border-color:var(--teal);color:var(--teal)' : ''}">Retake Quiz</button>` : `<button class="btn-primary" onclick="openQuiz()" style="${startBtnStyle}">Start Quiz →</button>`}
      </div>
    </div>
    <div class="quiz-panel" id="quiz-panel"></div>
  </div>`;

  if (appState.showQuiz) { document.getElementById('quiz-panel').classList.add('open'); renderQuiz(); }
}

function renderWelcome() {
  document.getElementById('main-area').innerHTML = `<div class="welcome fade-in">
    <div class="welcome-badge">🐧 Linux Mastery Path</div>
    <h1 class="welcome-h1">Learn Linux,<br><em>Layer by Layer</em></h1>
    <p class="welcome-sub">Five complete modules covering the full Linux stack — from graphical applications and desktop environments all the way down to CPU architecture, memory management, storage I/O, and networking hardware. Each part must be mastered before the next unlocks.</p>
    <div class="rules-grid">
      <div class="rule-card"><div class="rule-emoji">🖥️</div><div class="rule-title">Module 1 — UI Layer</div><div class="rule-desc">Applications → Desktop Environment → Window System → Display Manager → Complete Flow</div></div>
      <div class="rule-card"><div class="rule-emoji">⚙️</div><div class="rule-title">Module 2 — System Services</div><div class="rule-desc">Boot Process → systemd → systemctl → Filesystem & Processes → Networking & Storage</div></div>
      <div class="rule-card"><div class="rule-emoji">🗂️</div><div class="rule-title">Module 3 — Linux Commands</div><div class="rule-desc">Navigation & Files → Text Processing & I/O → Process Monitoring → Permissions & Archives → Networking & Shell Power</div></div>
      <div class="rule-card" style="border-color:rgba(8,145,178,.2);background:var(--cyan-lt)"><div class="rule-emoji">📜</div><div class="rule-title" style="color:var(--cyan)">Module 4 — Linux Kernel</div><div class="rule-desc">Architecture & Core Concepts → How the Kernel Boots → Processes & Resources → Devices & Filesystems → Tuning & Monitoring</div></div>
      <div class="rule-card" style="border-color:rgba(124,58,237,.2);background:#f5f3ff"><div class="rule-emoji">🔩</div><div class="rule-title" style="color:#7c3aed">Module 5 — Hardware Layer</div><div class="rule-desc">CPU & Execution → Memory Architecture → Storage Hardware & I/O → Networking Stack → The Complete Hardware Picture</div></div>
    </div>
    <button class="start-btn" onclick="selectTopic('apps')">Begin Module 1 →</button>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════════
// QUIZ ENGINE
// ═══════════════════════════════════════════════════════════════════
function openQuiz() {
  appState.showQuiz = true;
  const panel = document.getElementById('quiz-panel');
  panel.classList.add('open');
  const data = td(appState.currentTopic);
  quizSession = { topicId: appState.currentTopic, attempt: data.attempts + 1, answers: {}, submitted: false };
  renderQuiz();
  setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
}

function renderQuiz() {
  const panel = document.getElementById('quiz-panel');
  if (!panel || !quizSession) return;
  const topic = ALL_TOPICS.find(t => t.id === quizSession.topicId);
  const isM2 = topic.module === 2;
  const isM3 = topic.module === 3;
  const isM4 = topic.module === 4;
  const isM5 = topic.module === 5;
  const data = td(quizSession.topicId);
  const answeredCount = Object.keys(quizSession.answers).length;
  const total = topic.quiz.length;
  const progPct = Math.round(answeredCount / total * 100);
  const allAnswered = answeredCount === total;
  const showHints = quizSession.attempt >= 3;

  let pips = '';
  for (let i = 0; i < 2; i++) { pips += `<div class="pip${i < data.attempts ? ' used' : ''}"></div>`; }

  const qCards = topic.quiz.map((q, qi) => {
    const sel = quizSession.answers[qi];
    const letters = ['A', 'B', 'C', 'D', 'E'];
    const opts = q.opts.map((opt, oi) => {
      let cls = 'opt';
      if (quizSession.submitted) { if (oi === q.ans) cls += ' correct'; else if (sel === oi) cls += ' wrong'; } else if (sel === oi) cls += ' sel';
      const dis = quizSession.submitted ? 'disabled' : '';
      return `<button class="${cls}" ${dis} onclick="pickAnswer(${qi},${oi})"><span class="opt-letter">${letters[oi]}</span>${opt}</button>`;
    }).join('');
    const hint = (showHints && !quizSession.submitted) ? `<div class="hint-box show"><b>💡 Hint:</b>&nbsp;${q.hint}</div>` : '';
    return `<div class="q-card"><div class="q-num">Question ${qi + 1} of ${total}</div><div class="q-text">${q.q}</div><div class="options">${opts}</div>${hint}</div>`;
  }).join('');

  const progressStyle = isM5 ? 'background:linear-gradient(90deg,#7c3aed,#a855f7)' : isM4 ? 'background:linear-gradient(90deg,var(--cyan),#0ea5e9)' : isM3 ? 'background:linear-gradient(90deg,var(--orange),#f59e0b)' : isM2 ? 'background:linear-gradient(90deg,var(--teal),#0ea5e9)' : '';
  const submitStyle = isM5 ? 'background:linear-gradient(135deg,#7c3aed,#a855f7)' : isM4 ? 'background:linear-gradient(135deg,var(--cyan),#0ea5e9)' : isM3 ? 'background:linear-gradient(135deg,var(--orange),#f59e0b)' : isM2 ? 'background:linear-gradient(135deg,var(--teal),#0ea5e9)' : '';
  const footer = quizSession.submitted ? '' : `<div class="quiz-footer"><button class="btn-primary" id="submit-btn" ${allAnswered ? '' : 'disabled'} onclick="submitQuiz()" style="${submitStyle}">Submit Answers</button>${showHints ? `<span style="font-size:.8rem;color:var(--amber);font-weight:600;">💡 Hints active — attempt ${quizSession.attempt}</span>` : ''}</div>`;

  panel.innerHTML = `<div class="quiz-header"><div class="quiz-header-title">📝 Knowledge Check — ${topic.title}</div><div class="quiz-header-meta"><span class="attempt-badge">Attempt ${quizSession.attempt}</span><div class="pip-row">${pips}</div></div></div>
  <div class="quiz-progress-wrap"><div class="quiz-progress-fill" id="qpfill" style="width:${progPct}%;${progressStyle}"></div></div>
  ${qCards}${footer}<div class="result-box" id="result-box"></div>`;
}

function pickAnswer(qi, oi) {
  if (quizSession.submitted) return;
  quizSession.answers[qi] = oi;
  const cards = document.querySelectorAll('.q-card');
  cards[qi].querySelectorAll('.opt').forEach((btn, i) => {
    btn.className = 'opt' + (i === oi ? ' sel' : '');
    const letter = btn.querySelector('.opt-letter');
    if (i === oi) { letter.style.background = 'var(--indigo)'; letter.style.color = '#fff'; letter.style.borderColor = 'var(--indigo)'; }
    else { letter.style.background = ''; letter.style.color = ''; letter.style.borderColor = ''; }
  });
  const answered = Object.keys(quizSession.answers).length;
  const total = ALL_TOPICS.find(t => t.id === quizSession.topicId).quiz.length;
  const pf = document.getElementById('qpfill'); if (pf) pf.style.width = Math.round(answered / total * 100) + '%';
  const sb = document.getElementById('submit-btn'); if (sb && answered === total) sb.disabled = false;
}

function submitQuiz() {
  const topic = ALL_TOPICS.find(t => t.id === quizSession.topicId);
  quizSession.submitted = true;
  let correct = 0;
  topic.quiz.forEach((q, i) => { if (quizSession.answers[i] === q.ans) correct++; });
  const score = Math.round(correct / topic.quiz.length * 100);
  const passed = score >= 80;
  const data = td(quizSession.topicId);
  data.attempts += 1;
  if (passed) { data.passed = true; data.score = score; } else if (score > data.score) data.score = score;
  save();
  renderQuiz();
  const rb = document.getElementById('result-box');
  const topicIdx = ALL_TOPICS.findIndex(t => t.id === quizSession.topicId);
  const hasNext = topicIdx + 1 < ALL_TOPICS.length;
  const nextTopic = hasNext ? ALL_TOPICS[topicIdx + 1] : null;
  const nextUnlocked = hasNext && isUnlocked(topicIdx + 1);

  const justUnlockedM2 = passed && topic.module === 1 && topicIdx === MODULE1.length - 1;
  const justUnlockedM3 = passed && topic.module === 2 && topicIdx === MODULE1.length + MODULE2.length - 1;
  const justUnlockedM4 = passed && topic.module === 3 && topicIdx === MODULE1.length + MODULE2.length + MODULE3.length - 1;
  const justUnlockedM5 = passed && topic.module === 4 && topicIdx === MODULE1.length + MODULE2.length + MODULE3.length + MODULE4.length - 1;

  let completionMsg = '';
  if (passed) {
    if (justUnlockedM2) {
      completionMsg = `You answered ${correct} of ${topic.quiz.length} correctly. 🎉 <strong>Module 2 is now unlocked!</strong>`;
    } else if (justUnlockedM3) {
      completionMsg = `You answered ${correct} of ${topic.quiz.length} correctly. 🚀 <strong>Module 3 — Linux Commands is now unlocked!</strong>`;
    } else if (justUnlockedM4) {
      completionMsg = `You answered ${correct} of ${topic.quiz.length} correctly. ⚡ <strong>Module 4 — Linux Kernel is now unlocked!</strong>`;
    } else if (justUnlockedM5) {
      completionMsg = `You answered ${correct} of ${topic.quiz.length} correctly. 🔩 <strong>Module 5 — Hardware Layer is now unlocked!</strong>`;
    } else if (hasNext) {
      completionMsg = `You answered ${correct} of ${topic.quiz.length} correctly. "${nextTopic.title}" is now unlocked! 🔓`;
    } else {
      completionMsg = `You answered ${correct} of ${topic.quiz.length} correctly. You've completed all modules! 🏆`;
    }
  } else {
    completionMsg = `You got ${correct} of 5 correct. You need 4 to pass. ${data.attempts >= 2 ? 'Hints are now enabled on your next attempt.' : `Hints appear after ${2 - data.attempts} more attempt(s).`}`;
  }

  let btns = '';
  if (passed && hasNext && nextUnlocked) btns += `<button class="btn-primary" onclick="selectTopic('${nextTopic.id}')">🚀 Next: ${nextTopic.title}</button>`;
  if (justUnlockedM2 && passed) btns += `<button class="btn-primary" style="background:linear-gradient(135deg,var(--teal),#0ea5e9)" onclick="selectTopic('${MODULE2[0].id}')">⚙️ Start Module 2</button>`;
  if (justUnlockedM3 && passed) btns += `<button class="btn-primary" style="background:linear-gradient(135deg,var(--orange),#f59e0b)" onclick="selectTopic('${MODULE3[0].id}')">🖥️ Start Module 3</button>`;
  if (justUnlockedM4 && passed) btns += `<button class="btn-primary" style="background:linear-gradient(135deg,var(--cyan),#0ea5e9)" onclick="selectTopic('${MODULE4[0].id}')">🐧 Start Module 4</button>`;
  if (justUnlockedM5 && passed) btns += `<button class="btn-primary" style="background:linear-gradient(135deg,#7c3aed,#a855f7)" onclick="selectTopic('${MODULE5[0].id}')">🔩 Start Module 5</button>`;
  if (!passed) btns += `<button class="btn-primary" onclick="openQuiz()">Try Again${data.attempts >= 2 ? ' (Hints On)' : ''}</button>`;
  btns += `<button class="btn-secondary" onclick="closeQuiz()">Review Content</button>`;

  rb.className = `result-box show ${passed ? 'pass' : 'fail'}`;
  rb.innerHTML = `<div class="result-emoji">${passed ? '🎉' : score >= 50 ? '😅' : '😓'}</div>
    <div class="result-score">${score}%</div>
    <div class="result-label">${passed ? 'Great job! You passed!' : score >= 50 ? 'Almost there!' : 'Keep studying!'}</div>
    <div class="result-msg">${completionMsg}</div>
    <div class="result-btns">${btns}</div>`;
  rb.scrollIntoView({ behavior: 'smooth', block: 'center' });
  renderSidebar();
}

function closeQuiz() {
  appState.showQuiz = false;
  const panel = document.getElementById('quiz-panel');
  if (panel) { panel.classList.remove('open'); panel.innerHTML = ''; }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function selectTopic(id) {
  appState.currentTopic = id; appState.showQuiz = false; quizSession = null;
  renderSidebar(); renderMain(); save();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetProgress() {
  if (!confirm('Reset ALL progress for all five modules? This cannot be undone.')) return;
  appState = { currentTopic: null, showQuiz: false, topicData: {} }; quizSession = null;
  try { localStorage.removeItem(SAVE_KEY); } catch(e) {}
  renderSidebar(); renderMain();
}

// BOOT
renderSidebar(); renderMain(); save();
