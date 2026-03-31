def generate_pk_name(model_class) -> str:
    pk = model_class.__mapper__.primary_key[0]
    return pk.name


def get_model_tablename(model_class) -> str:
    return model_class.__tablename__