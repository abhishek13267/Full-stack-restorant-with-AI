import shutil
import os

source_dir = r'C:\Users\Abhi\.gemini\antigravity\brain\e0305fc0-85e0-41f4-a269-48d98bdb141d'
dest_dir = r'c:\Users\Abhi\OneDrive\Desktop\Abhi 2\only project\Restorant web'

files = {
    'saffron_sage_logo_1774089447794.png': 'images/logo_gen.png',
    'fine_dining_hero_1774089481260.png': 'images/bg/hero_gen.png',
    'organic_farm_sourcing_1774089559867.png': 'images/img/sourcing_gen.png',
    'artisanal_cooking_craft_1774089611138.png': 'images/img/craft_gen.png'
}

for src_name, dest_rel in files.items():
    src_path = os.path.join(source_dir, src_name)
    dest_path = os.path.join(dest_dir, dest_rel)
    try:
        shutil.copy(src_path, dest_path)
        print(f"Copied {src_name} to {dest_rel}")
    except Exception as e:
        print(f"Failed to copy {src_name}: {e}")
