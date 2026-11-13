"""
Shree Self Driving - Automatic GitHub Synchronizer
Watches all project files and automatically commits & pushes changes to GitHub.
"""

import os
import sys
import time
import datetime
import subprocess

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
IGNORE_DIRS = {'.git', 'node_modules', '__pycache__', '.gemini', 'scratch'}
IGNORE_EXTS = {'.log', '.tmp'}
IGNORE_FILES = {'Shree-Quotation-Calculator.zip'}

def get_git_exe():
    # Check PATH or common installation locations
    for p in [
        'git',
        r'C:\Program Files\Git\cmd\git.exe',
        r'C:\Program Files\Git\bin\git.exe',
        r'C:\Program Files (x86)\Git\cmd\git.exe',
        os.path.expanduser(r'~\AppData\Local\Programs\Git\cmd\git.exe')
    ]:
        try:
            res = subprocess.run([p, '--version'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if res.returncode == 0:
                return p
        except Exception:
            continue
    return 'git'

def get_file_state():
    state = {}
    for root, dirs, files in os.walk(PROJECT_DIR):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            if f in IGNORE_FILES:
                continue
            ext = os.path.splitext(f)[1].lower()
            if ext in IGNORE_EXTS:
                continue
            full_path = os.path.join(root, f)
            try:
                state[full_path] = os.path.getmtime(full_path)
            except OSError:
                pass
    return state

def run_git(git_exe, args):
    try:
        res = subprocess.run([git_exe] + args, cwd=PROJECT_DIR, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return res.returncode, res.stdout.strip(), res.stderr.strip()
    except Exception as e:
        return 1, '', str(e)

def sync():
    git_exe = get_git_exe()
    print("=" * 65)
    print("  SHREE SELF DRIVING - REALTIME GITHUB AUTO-SYNC")
    print(f"  Watching: {PROJECT_DIR}")
    print(f"  Git Executable: {git_exe}")
    print("  Changes will automatically upload to GitHub in real-time.")
    print("  Press Ctrl+C to stop.")
    print("=" * 65)

    last_state = get_file_state()

    while True:
        try:
            time.sleep(2)
            current_state = get_file_state()

            # Check if files were added, deleted or modified
            changed = False
            if set(current_state.keys()) != set(last_state.keys()):
                changed = True
            else:
                for path, mtime in current_state.items():
                    if path not in last_state or abs(mtime - last_state[path]) > 0.001:
                        changed = True
                        break

            if changed:
                print("\n[DETECTED] File change detected. Waiting 3s for write to complete...")
                time.sleep(3)
                last_state = get_file_state()

                # Check git status
                code, stdout, stderr = run_git(git_exe, ['status', '--porcelain'])
                if not stdout:
                    print("[INFO] No git changes to commit.")
                    continue

                print("[SYNC] Staging changes...")
                run_git(git_exe, ['add', '-A'])

                timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                commit_msg = f"Auto-sync: update project files ({timestamp})"
                print(f"[SYNC] Committing: '{commit_msg}'...")
                code, stdout, stderr = run_git(git_exe, ['commit', '-m', commit_msg])

                print("[SYNC] Pushing to GitHub (origin main)...")
                code, stdout, stderr = run_git(git_exe, ['push', 'origin', 'main'])
                if code == 0:
                    print(f"✅ [SUCCESS] Changes uploaded to GitHub successfully at {timestamp}!")
                else:
                    print(f"⚠️ [PUSH ERROR]: {stderr}")
                    print("   If this is the first push, check your GitHub authentication.")

        except KeyboardInterrupt:
            print("\nAuto-sync stopped by user.")
            sys.exit(0)
        except Exception as e:
            print(f"[ERROR] {e}")
            time.sleep(3)

if __name__ == '__main__':
    sync()
