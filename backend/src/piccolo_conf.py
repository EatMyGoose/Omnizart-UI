#from piccolo.conf.apps import AppRegistry
from piccolo.engine.sqlite import SQLiteEngine


DB = SQLiteEngine(path='/data/db.sqlite')

# A list of paths to piccolo apps
# e.g. ['blog.piccolo_app']
#APP_REGISTRY = AppRegistry(apps=[])
