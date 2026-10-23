#!/usr/bin/env python3
"""
Sincroniza os arquivos de áudio do projeto com 'lista_musicas.json'.

As músicas podem ficar:
  - na raiz do projeto; ou
  - dentro de pastas (cada pasta vira um álbum).

O script varre o projeto inteiro (ignorando pastas ocultas e de build),
lê metadados ID3 quando o pacote 'mutagen' estiver disponível e gera um
catálogo sem duplicatas, ordenado alfabeticamente.
"""
import json
import re
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
OUTPUT_FILE = ROOT_DIR / "lista_musicas.json"

AUDIO_EXTENSIONS = {
    ".mp3", ".m4a", ".aac", ".ogg", ".oga", ".opus",
    ".wav", ".flac", ".webm", ".wma", ".aiff", ".aif",
}

EXCLUDED_DIRS = {
    ".git", ".github", "node_modules", "venv", ".venv",
    "__pycache__", ".idea", ".vscode", "dist", "build",
}

try:
    from mutagen import File as MutagenFile
except ImportError:  # pragma: no cover - depende do ambiente
    MutagenFile = None


def prettify_name(part: str) -> str:
    """Deixa nomes de pastas mais apresentáveis sem estragar siglas."""
    part = part.replace("_", " ").strip()
    if not part:
        return ""
    if part.isupper() and len(part) > 1:
        return part

    def capitalize_word(match: re.Match) -> str:
        word = match.group(0)
        return word[0].upper() + word[1:]

    return re.sub(r"[A-Za-zÀ-ÿ0-9]+", capitalize_word, part)


def format_album_name(rel_parts: tuple) -> str:
    if not rel_parts:
        return "Geral"
    return " › ".join(prettify_name(part) for part in rel_parts if part)


def natural_key(value: str):
    """Ordena '2 - Faixa' antes de '10 - Faixa'."""
    return [
        (1, int(chunk)) if chunk.isdigit() else (0, chunk.lower())
        for chunk in re.split(r"(\d+)", value)
    ]


def read_metadata(path: Path) -> dict:
    metadata = {
        "title": None,
        "artist": None,
        "album": None,
        "duration": None,
    }

    if MutagenFile is None:
        return metadata

    try:
        audio = MutagenFile(path, easy=True)
        if audio is None:
            return metadata

        def first_tag(key):
            values = audio.get(key)
            if not values:
                return None
            value = str(values[0]).strip()
            return value or None

        metadata["title"] = first_tag("title")
        metadata["artist"] = first_tag("artist")
        metadata["album"] = first_tag("album")

        if getattr(audio, "info", None) is not None:
            length = getattr(audio.info, "length", None)
            if length:
                metadata["duration"] = round(float(length), 1)
    except Exception as exc:  # arquivo corrompido ou formato sem suporte
        print(f"  ! Não foi possível ler metadados de {path.name}: {exc}", file=sys.stderr)

    return metadata


def is_excluded(rel_path: Path) -> bool:
    for part in rel_path.parts:
        if part in EXCLUDED_DIRS or (part.startswith(".") and part != "."):
            return True
    return False


def generate_music_list() -> None:
    categories = {}
    total_files = 0
    seen_paths = set()

    for path in sorted(ROOT_DIR.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in AUDIO_EXTENSIONS:
            continue

        rel_path = path.relative_to(ROOT_DIR)
        if is_excluded(rel_path):
            continue

        rel_posix = rel_path.as_posix()
        if rel_posix in seen_paths:
            continue
        seen_paths.add(rel_posix)

        rel_folder = rel_path.parent
        rel_parts = () if str(rel_folder) == "." else rel_folder.parts
        folder_key = "/".join(rel_parts)
        album_name = format_album_name(rel_parts)

        if folder_key not in categories:
            categories[folder_key] = {
                "album": album_name,
                "folder": folder_key,
                "tracks": [],
            }

        metadata = read_metadata(path)

        categories[folder_key]["tracks"].append({
            "name": path.name,
            "path": rel_posix,
            "title": metadata["title"] or path.stem,
            "artist": metadata["artist"],
            "album": metadata["album"],
            "duration": metadata["duration"],
        })
        total_files += 1

    result = []
    for folder_key in sorted(
        categories.keys(),
        key=lambda key: (key != "", categories[key]["album"].lower()),
    ):
        album = categories[folder_key]
        album["tracks"].sort(key=lambda track: natural_key(track["name"]))
        album["count"] = len(album["tracks"])
        result.append(album)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
        json.dump(result, file, indent=2, ensure_ascii=False)
        file.write("\n")

    tag_status = "com metadados ID3" if MutagenFile else "sem metadados ID3 (instale 'mutagen')"
    print(
        f"✓ {total_files} música(s) em {len(result)} álbum(ns) sincronizada(s) "
        f"{tag_status} em '{OUTPUT_FILE.name}'."
    )


if __name__ == "__main__":
    generate_music_list()
