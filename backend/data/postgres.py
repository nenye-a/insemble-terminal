from decouple import config
import psycopg2
from cuid import cuid

'''

File to manage the connection to PostGres resources. This includes
management to the connection, as well as helper functions for requests.

'''

# Authentication
DB_NAME = "insemble-terminal"
DB_USER = config("DB_USER")
DB_PASS = config("DB_PASS")
DB_URL = config("DATABASE_URL")
REMOTE_URL = "postgres://" in DB_URL


class PostConnect(object):

    def __init__(self):
        self.connection = self.get_connection()
        self.tables = self.list_tables()

    @staticmethod
    def get_connection():
        if REMOTE_URL:
            return psycopg2.connect(DB_URL)
        else:
            # Local database connection
            return psycopg2.connect(
                dbname=DB_NAME,
                user=DB_USER,
                password=DB_PASS
            )

    def get_cursor(self):
        return self.connection.cursor()

    def list_tables(self, print_out=False):
        with self.connection.cursor() as cursor:
            cursor.execute("""SELECT table_name FROM information_schema.tables
                    WHERE table_schema = 'public'""")
            table_list = [table[0] for table in cursor.fetchall()]
        if print_out:
            print(table_list)
        return table_list

    def query(self, table, query):
        pass

    def insert(self, table, document):
        """
        Insert document into table. Document is a dictionary
        of keys (table columns) to values (item values).
        Will return id of the item.
        """
        if table not in self.tables:
            raise Exception('Table {} not in database.'.format(table))
        document['id'] = cuid()
        keys, values = zip(*document.items())
        positioner = tuple(r"%s" for value in values)
        query_string = 'INSERT INTO "{table}" {keys} VALUES{positioner}'.format(
            table=table,
            keys=self._convert_iter(keys),
            positioner=self._convert_iter(positioner)
        )
        with self.get_cursor() as cursor:
            cursor.execute(query_string, values)
            self.commit()

        return document['id']

    def _convert_iter(self, iterable):
        string = ""
        for item in iterable:
            string += str(item) + ", "
        string = string.strip(", ")
        return "({})".format(string)

    def close(self):
        self.connection.close()

    def commit(self):
        self.connection.commit()


h = PostConnect()
h.list_tables(True)
print(h.insert("BusinessTag", {"params": "Hello", "type": "Business"}))
