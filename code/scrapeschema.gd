# scrapeschema.gd

extends SceneTree

"""
a string literal lives here
"""

func _init() -> void:
	# scrapeSchema to godot_api_schema
	scrapeSchema("res://godot_api_schema.json")
	quit()


func get_variant_names() -> Array[String]:
	var names: Array[String] = ["Variant"]
	for type_id in range(1, TYPE_MAX):
		var type_name: String = type_string(type_id)
		if not type_name.is_empty() and not names.has(type_name):
			names.append(type_name)
	names.sort()
	return names


func is_editor_class(item_name: String) -> bool:
	return item_name.begins_with("Editor") or item_name.begins_with("ResourceImporter")


func populate_categories(all_classes: PackedStringArray, nodes: Array[String], resources: Array[String], objects: Array[String], editors: Array[String]) -> void:
	for registered_class in all_classes:
		var current_name: String = str(registered_class)

		if ClassDB.is_parent_class(current_name, "Node"):
			nodes.append(current_name)

		if ClassDB.is_parent_class(current_name, "Resource"):
			resources.append(current_name)

		if ClassDB.is_parent_class(current_name, "Object"):
			objects.append(current_name)

		if is_editor_class(current_name):
			editors.append(current_name)

	nodes.sort()
	resources.sort()
	objects.sort()
	editors.sort()


func build_schema_dictionary() -> Dictionary:
	var all_classes: PackedStringArray = ClassDB.get_class_list()
	var nodes: Array[String] = []
	var resources: Array[String] = []
	var objects: Array[String] = []
	var editors: Array[String] = []

	populate_categories(all_classes, nodes, resources, objects, editors)

	var version_info: Dictionary = Engine.get_version_info()
	var version_string: String = "%d.%d.%d" % [
		version_info.get("major", 0),
		version_info.get("minor", 0),
		version_info.get("patch", 0)
	]

	var schema: Dictionary = {
		"name": "godot",
		"version": "0.1.0",
		"description": "Godot Engine",
		"latest": version_string,
		"copyright": "(c) 2014 Juan Linietsky, Ariel Manzur and the Godot community",
		"license": "CC BY 3.0",
		"repository": {
			"type": "git",
			"url": "https://github.com/nitrologic/biblispec"
		},
		"curator": "nitrologic",
		"variant": get_variant_names(),
		"globals": [
			"@GDScript",
			"@GlobalScope"
		],
		"node": nodes,
		"resource": resources,
		"object": objects,
		"editor": editors
	}

	return schema


func scrapeSchema(target_path: String) -> void:
	var schema: Dictionary = build_schema_dictionary()
	var json_text: String = JSON.stringify(schema, "\t")

	var file: FileAccess = FileAccess.open(target_path, FileAccess.WRITE)
	if file != null:
		file.store_string(json_text)
		file.close()
		print("Export completed: ", target_path)
	else:
		printerr("Failed to open path for writing: ", target_path)
