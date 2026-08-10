from __future__ import annotations

import copy
import glob
import os
import re
import sys

import yaml


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
LAYOUT_DIR = os.path.dirname(__file__)
HOME = os.path.join(LAYOUT_DIR, "home.yaml")


def load(path):
    with open(path, encoding="utf-8") as stream:
        return yaml.safe_load(stream) or {}


def particle_type(path):
    try:
        return load(path).get("type", "particle")
    except yaml.YAMLError:
        # A few legacy blueprints contain unquoted colons in help text. Their
        # first lines still declare the type unambiguously.
        text = open(path, encoding="utf-8").read(1000)
        match = re.search(r"^type:\s*([^\s]+)", text, re.MULTILINE)
        return match.group(1) if match else "particle"


def particle_names():
    files = (
        glob.glob(os.path.join(ROOT, "engines/common/nucleus/particles/*.yaml"))
        + glob.glob(os.path.join(ROOT, "themes/ambrosia/common/particles/*.yaml"))
    )
    return sorted(
        os.path.splitext(os.path.basename(path))[0]
        for path in files
        if particle_type(path) == "particle"
    )


def blueprints():
    result = {}
    paths = (
        glob.glob(os.path.join(ROOT, "engines/common/nucleus/particles/*.yaml"))
        + glob.glob(os.path.join(ROOT, "themes/ambrosia/common/particles/*.yaml"))
    )
    for path in paths:
        name = os.path.splitext(os.path.basename(path))[0]
        try:
            result[name] = load(path)
        except yaml.YAMLError:
            pass
    return result


def sample_value(key, field, item=1):
    if "default" in field:
        return copy.deepcopy(field["default"])
    field_type = str(field.get("type", ""))
    leaf = key.lstrip(".").split(".")[-1].lower()
    if "checkbox" in field_type:
        return True
    if "number" in field_type or "range" in field_type:
        return field.get("min", 1)
    if "color" in field_type:
        return "#7c4dff"
    if "image" in field_type or leaf in {"image", "img", "src", "avatar", "logo"}:
        return f"genesis-media://demo/home/mainbar/img-0{item % 2 + 1}.jpg"
    if "icon" in field_type or leaf == "icon":
        return "fa fa-star"
    if field.get("options"):
        return next(iter(field["options"]))
    if leaf in {"link", "url", "href", "buttonlink", "readmorelink"} or leaf.endswith("link"):
        return "#"
    if "target" in leaf:
        return "_self"
    if "class" in leaf:
        return "particle-test-option"
    if leaf in {"title", "name", "headline", "heading"}:
        return f"Ambrosia Test Item {item}"
    if "button" in leaf or leaf in {"label", "linktext", "readmore"}:
        return "Learn More"
    if "text" in field_type or "textarea" in field_type or field_type.startswith("input."):
        return f"Responsive particle test content for item {item}."
    return None


def schema_attributes(blueprint):
    attributes = {}

    def walk(fields, target):
        for key, field in (fields or {}).items():
            if not isinstance(field, dict):
                continue
            nested = field.get("fields")
            if field.get("type") == "collection.list":
                items = []
                for item_number in range(1, 4):
                    item = {}
                    for child_key, child in (nested or {}).items():
                        value = sample_value(child_key, child, item_number)
                        if value is not None:
                            item[child_key.lstrip(".")] = value
                    item.setdefault("name", f"Test Item {item_number}")
                    items.append(item)
                target[key.lstrip(".")] = items
            elif nested:
                walk(nested, target)
            elif not key.startswith("_") and field.get("type") not in {"separator.note", "separator.section"}:
                value = sample_value(key, field)
                if value is not None:
                    target[key.lstrip(".")] = value

    walk((blueprint.get("form") or {}).get("fields"), attributes)
    return attributes


def examples():
    found = {}
    paths = glob.glob(os.path.join(ROOT, "themes/*/common/layouts/*.yaml"))
    paths = [path for path in paths if not re.search(r"particles_[1-5]\.yaml$", path)]
    # Prefer Ambrosia examples, which match its styling and media paths.
    paths.sort(key=lambda path: ("themes\\ambrosia\\" not in path.lower(), path))
    for path in paths:
        try:
            content = load(path).get("content", {})
        except yaml.YAMLError:
            continue
        if not isinstance(content, dict):
            continue
        for particle_id, settings in content.items():
            kind = re.sub(r"-\d+$", "", str(particle_id))
            if kind not in found and isinstance(settings, dict):
                found[kind] = copy.deepcopy(settings)
    return found


def populated_fallback(name):
    title = name.replace("-", " ").replace("_", " ").title()
    return {"title": title, "attributes": {}}


def test_settings(name, sample, blueprint, location, index):
    value = copy.deepcopy(sample or populated_fallback(name))
    value["title"] = f"{name.replace('-', ' ').title()} — {location.title()}"
    populated = schema_attributes(blueprint or {})
    populated.update(value.get("attributes", {}))
    value["attributes"] = populated
    attrs = value["attributes"]
    if isinstance(attrs, dict):
        attrs.setdefault("enabled", "1")
        # Make copied examples self-contained within Ambrosia.
        def replace_media(node):
            if isinstance(node, dict):
                for key, child in list(node.items()):
                    if key in {"image", "src"} and isinstance(child, str) and child:
                        node[key] = "genesis-media://demo/home/mainbar/img-0%d.jpg" % (index % 2 + 1)
                    else:
                        replace_media(child)
            elif isinstance(node, list):
                for child in node:
                    replace_media(child)
        replace_media(attrs)
    value.setdefault("block", {})
    value["block"].setdefault("class", f"particle-test particle-test-{name}")
    return value


def make_layout(number, names, samples, blueprint_map, home):
    result = {}
    result["version"] = 2
    result["preset"] = {
        "image": "genesis-admin://images/layouts/home.png",
        "name": f"Particles {number}",
        "timestamp": 1786258800 + number,
    }

    ids = {}
    for index, name in enumerate(names):
        ids[(name, "mainbar")] = f"{name}-{number}1{index:02d}"
        ids[(name, "sidebar")] = f"{name}-{number}2{index:02d}"

    showcase_names = names[: min(3, len(names))]
    feature_names = names[3 : min(7, len(names))]
    result["layout"] = dict([
        ("/header/", copy.deepcopy(home["layout"]["/header/"])),
        ("/navigation/", copy.deepcopy(home["layout"]["/navigation/"])),
        ("/slideshow/", copy.deepcopy(home["layout"]["/slideshow/"])),
        ("/showcase/", [[f"{name}-{number}3{i:02d}" for i, name in enumerate(showcase_names)]]),
        ("/feature/", [[f"{name}-{number}4{i:02d}" for i, name in enumerate(feature_names)]]),
        (f"/container-particles-{number}/", [[
            {"mainbar 67": [[ids[(name, "mainbar")]] for name in names]},
            {"sidebar 33": [[ids[(name, "sidebar")]] for name in names]},
        ]]),
        ("offcanvas", copy.deepcopy(home["layout"]["offcanvas"])),
    ])

    result["structure"] = dict([
        ("header", copy.deepcopy(home["structure"]["header"])),
        ("navigation", copy.deepcopy(home["structure"]["navigation"])),
        ("slideshow", copy.deepcopy(home["structure"]["slideshow"])),
        ("showcase", {"type": "section", "attributes": {"boxed": "", "class": "particle-tests"}}),
        ("feature", {"type": "section", "attributes": {"boxed": "", "class": "particle-tests"}}),
        ("mainbar", {"type": "section", "attributes": {"class": "particle-tests"}}),
        ("sidebar", {"type": "section", "attributes": {"class": "particle-tests"}}),
        (f"container-particles-{number}", {"attributes": {"boxed": ""}}),
    ])

    content = {}
    retained = set()
    for section in ("/header/", "/navigation/", "/slideshow/", "offcanvas"):
        retained.update(re.findall(r"[a-z][a-z0-9-]*-\d+", str(home["layout"][section])))
    for particle_id in retained:
        if particle_id in home.get("content", {}):
            content[particle_id] = copy.deepcopy(home["content"][particle_id])
    for index, name in enumerate(names):
        for location in ("mainbar", "sidebar"):
            content[ids[(name, location)]] = test_settings(name, samples.get(name), blueprint_map.get(name), location, index)
    for index, name in enumerate(showcase_names):
        content[f"{name}-{number}3{index:02d}"] = test_settings(name, samples.get(name), blueprint_map.get(name), "showcase", index + 1)
    for index, name in enumerate(feature_names):
        content[f"{name}-{number}4{index:02d}"] = test_settings(name, samples.get(name), blueprint_map.get(name), "feature", index + 1)
    result["content"] = content
    return result


def main():
    home = load(HOME)
    names = particle_names()
    samples = examples()
    blueprint_map = blueprints()
    groups = [names[i::5] for i in range(5)]
    for number, group in enumerate(groups, 1):
        data = make_layout(number, group, samples, blueprint_map, home)
        path = os.path.join(LAYOUT_DIR, f"particles_{number}.yaml")
        with open(path, "w", encoding="utf-8", newline="\n") as stream:
            yaml.safe_dump(data, stream, sort_keys=False, allow_unicode=True, width=120)
    missing = [name for name in names if name not in samples]
    print(f"Generated 5 layouts for {len(names)} particles; fallback settings used for: {', '.join(missing) or 'none'}")


if __name__ == "__main__":
    main()
