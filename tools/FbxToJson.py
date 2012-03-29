#!/usr/bin/env python

import sys
import os
import argparse
import json

from fbx import *



def convert_fbx(file, output):
	"""convert_fbx walks the scene in an FBX format file, and outputs
       the same scene in JSON format, for use from WebGL applications.
	"""
	print 'Converting FBX file \'{0}\' to JSON \'{1}\'...'.format(file, output)
	
	# create root FBX SDK object.
	fbx = KFbxSdkManager.Create()
	importer = KFbxImporter.Create(fbx, '');
	
	# load importer class and handle version errors.
	status = importer.Initialize(file, -1, fbx.GetIOSettings())
	if (not status):
		error_id = importer.GetLastErrorID()
#		error_string = 'Unable to load \'{0}\' for convertion.'
#		if error_id == KFbxIO.eFILE_VERSION_NOT_SUPPORTED_YET:
#			error_string = 'Unable to convert \'{0}\' because it was created with a newer version of FBX.'
#		elif error_id == KFbxIO.eFILE_VERSION_NOT_SUPPORTED_ANYMORE:
#			error_string = 'Unable to convert \'{0}\' because it was created with an outdated version of FBX.'
		
#		print error_string.format()
		print importer.GetLastErrorString()
		return False
		
	# create an empty scene, and import our file into it.
	# TODO: Handle import options (KFbxIOSettings) for loading only parts of the scene 
	# 		we care about
	scene = KFbxScene.Create(fbx, "")
	status = importer.Import(scene)
	if (not status):
		print importer.GetLastErrorString()
		return False
		
	# TODO: Open file to write to?
	walk_scene(scene.GetRootNode())
	
	# cleanup
	KFbxScene.Destroy(scene)
	KFbxImporter.Destroy(importer)
	KFbxSdkManager.Destroy(fbx)
	return True
	
def walk_scene(node):
	if node:
		s = node.GetName()

		if node.GetNodeAttribute() == None:
			s += ' (No node attribute type)';
		else:
			attribute_type = node.GetNodeAttribute().GetAttributeType()
			if (attribute_type == KFbxNodeAttribute.eMARKER):
				s += ' (Marker)'
			elif (attribute_type == KFbxNodeAttribute.eSKELETON):
				s += ' (Skeleton)'
			elif (attribute_type == KFbxNodeAttribute.eMESH):
				s += ' (Mesh)'
			elif (attribute_type == KFbxNodeAttribute.eCAMERA):
				s += ' (Camera)'
			elif (attribute_type == KFbxNodeAttribute.eLIGHT):
				s += ' (Light)'
			else:
				s += ' (Unsupported)'

		print s
		
		# walk children
		for i in range(1, node.GetChildCount()):
			walk_scene(node.GetChild(i - 1))

def main():
	parser = argparse.ArgumentParser(description='Converts an FBX scene file into JSON.')
	parser.add_argument('input_file', metavar='FILE', nargs='?')
	parser.add_argument('--output', nargs='?')

	options = parser.parse_args()
	
	if (options.input_file == None and os.access(options.input_file, os.R_OK)):
		parser.error("a single fbx file to process must be provided")
		
	if (options.output == None):
		basename, extension = os.path.splitext(options.input_file)
		options.output = basename + '.json'
		
	if convert_fbx(options.input_file, options.output):
		fmt = 'Converted FBX file \'{0}\' to JSON \'{1}\' successfully!'
		print fmt.format(options.input_file, options.output)
		
if __name__ == "__main__":
	main()