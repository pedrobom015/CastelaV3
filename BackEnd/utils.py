
def truple_to_json(results_tuples,keys,dataModel):

	list_of_gender_models = []
	for row_tuple in results_tuples:
		row_dict = dict(zip(keys, row_tuple))
		gender_model_instance = dataModel(**row_dict)
		list_of_gender_models.append(gender_model_instance)

	return list_of_gender_models

def truple_to_json_list(list_field,list_tuple):

	# Lista para armazenar os dicionários (que serão convertidos em JSON)
	lista_de_dicionarios = []
	# Iterar sobre a tupla e criar os dicionários
	for item in list_tuple:
		row_dict = dict(zip(list_field, item))
		lista_de_dicionarios.append(row_dict)

	return lista_de_dicionarios
