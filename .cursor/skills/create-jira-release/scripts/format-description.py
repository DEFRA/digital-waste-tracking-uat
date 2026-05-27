#!/usr/bin/env python3
"""Convert release description input to Jira wiki markup for fix version descriptions."""

import argparse
import html
import re
import sys
from html.parser import HTMLParser


class _HtmlToText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag in {"p", "div", "br", "li", "tr", "h1", "h2", "h3", "h4"}:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in {"p", "div", "li", "tr", "h1", "h2", "h3", "h4"}:
            self.parts.append("\n")

    def handle_data(self, data):
        self.parts.append(data)

    def text(self):
        return re.sub(r"\n{3,}", "\n\n", "".join(self.parts)).strip()


def html_to_text(value):
    parser = _HtmlToText()
    parser.feed(value)
    return parser.text()


def inline_markdown_to_wiki(text):
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"[\1|\2]", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"*\1*", text)
    text = re.sub(r"__([^_]+)__", r"*\1*", text)
    text = re.sub(r"`([^`]+)`", r"{{\1}}", text)
    return text


def parse_markdown_table_row(line):
    if not line.strip().startswith("|"):
        return None
    cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
    if not cells:
        return None
    if all(re.match(r"^:?-+:?$", cell) for cell in cells):
        return "separator"
    return cells


def markdown_table_to_wiki(lines, start_index):
    rows = []
    index = start_index

    while index < len(lines):
        parsed = parse_markdown_table_row(lines[index].rstrip())
        if parsed is None:
            break
        if parsed != "separator":
            rows.append(parsed)
        index += 1

    if not rows:
        return [], start_index

    output = []
    header = rows[0]
    output.append("|| " + " || ".join(inline_markdown_to_wiki(cell) for cell in header) + " ||")
    for row in rows[1:]:
        padded = row + [""] * (len(header) - len(row))
        output.append("| " + " | ".join(inline_markdown_to_wiki(cell) for cell in padded[: len(header)]) + " |")

    return output, index


def markdown_to_wiki(value):
    lines = value.splitlines()
    output = []
    in_code = False
    index = 0

    while index < len(lines):
        raw_line = lines[index]
        line = raw_line.rstrip()

        if line.strip().startswith("```"):
            in_code = not in_code
            output.append("{code}")
            index += 1
            continue

        if in_code:
            output.append(line)
            index += 1
            continue

        if line.strip().startswith("|"):
            table_lines, index = markdown_table_to_wiki(lines, index)
            if table_lines:
                output.extend(table_lines)
                continue

        if not line.strip():
            output.append("")
            index += 1
            continue

        heading = re.match(r"^(#{1,6})\s+(.*)$", line)
        if heading:
            level = len(heading.group(1))
            prefix = "h1." if level == 1 else f"h{min(level, 6)}."
            output.append(f"{prefix} {inline_markdown_to_wiki(heading.group(2).strip())}")
            index += 1
            continue

        bullet = re.match(r"^[-*+]\s+(.*)$", line)
        if bullet:
            output.append(f"* {inline_markdown_to_wiki(bullet.group(1).strip())}")
            index += 1
            continue

        numbered = re.match(r"^\d+\.\s+(.*)$", line)
        if numbered:
            output.append(f"# {inline_markdown_to_wiki(numbered.group(1).strip())}")
            index += 1
            continue

        output.append(inline_markdown_to_wiki(line.strip()))
        index += 1

    return "\n".join(output).strip()


def convert(value, source_format):
    source_format = source_format.lower()

    if source_format == "wiki":
        return value.strip()
    if source_format == "text":
        return value.strip()
    if source_format == "html":
        return html_to_text(value)
    if source_format == "markdown":
        return markdown_to_wiki(value)

    raise ValueError(f"Unsupported format: {source_format}")


def main():
    parser = argparse.ArgumentParser(description="Format a Jira release description")
    parser.add_argument("input_file", help="Path to description source file")
    parser.add_argument(
        "--format",
        default="markdown",
        choices=["markdown", "wiki", "text", "html"],
        help="Input format (default: markdown)",
    )
    args = parser.parse_args()

    value = open(args.input_file, encoding="utf-8").read()
    print(convert(value, args.format))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)
