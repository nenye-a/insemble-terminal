from decouple import config
import psycopg2
import psycopg2.extras
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

    def __init__(self, connect=True):
        self.connection = None
        self.tables = None
        connect and self.connect()

    @staticmethod
    def get_connection():
        return psycopg2.connect(DB_URL)

    def get_cursor(self, *args, **kwargs):
        return self.connection.cursor(*args, **kwargs)

    def list_tables(self, print_out=False):
        with self.connection.cursor() as cursor:
            cursor.execute("""SELECT table_name FROM information_schema.tables
                    WHERE table_schema = 'public'""")
            table_list = [table[0] for table in cursor.fetchall()]
        if print_out:
            print(table_list)
        return table_list

    def find(self, table, query={}, projection='*'):
        self._check_table(table)
        columns = self._projection_string(projection)
        with self.get_cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
            if query:
                query_string, values = self._query_params(query)
            else:
                query_string = ""

            command_string = 'SELECT {columns} FROM "{table}" {query_string}'.format(
                columns=columns,
                table=table,
                query_string=query_string
            )
            command = cursor.mogrify(command_string, values) if query else command_string
            cursor.execute(command)
            return cursor.fetchall()

    def find_one(self, table, query={}, projection='*'):
        results = self.find(table, query, projection)
        if len(results) > 0:
            return results[0]

    def _projection_string(self, projection):
        string = ", ".join([word.strip() for word in projection.split(",")])
        return string

    def _query_params(self, query):
        query_string = ""
        values = []
        for key, value in query.items():
            # TODO: support key pathing
            item_string = '"{}"=%s AND'.format(key)
            values.append(value)
            query_string += item_string
        query_string = query_string.replace(' AND', '').strip()
        return "WHERE {}".format(query_string), tuple(values)

    def insert(self, table, document):
        """
        Insert document into table. Document is a dictionary
        of keys (table columns) to values (item values).
        Will return id of the item.
        """
        self._check_table(table)
        command, values = self._insert_params(table, document)
        with self.get_cursor() as cursor:
            cursor.execute(command, values)
        self.commit()
        return document['id']

    def _insert_params(self, table, document):
        document['id'] = cuid()
        keys, values = zip(*document.items())
        positioner = tuple(r"%s" for value in values)
        command = 'INSERT INTO "{table}" {keys} VALUES{positioner}'.format(
            table=table,
            keys=self._convert_iter(keys),
            positioner=self._convert_iter(positioner)
        )
        return command, values

    # def _insert_many_params(self, list_document):
    #     values_list = []
    #     positioner = None
    #     for document in list_document:
    #         document['id'] = cuid()
    #         keys, values = zip(*document.items())
    #         if not positioner:
    #             positioner = tuple(r"%s" for value in values)
    #         values_list.append(values)

    #     return keys, positioner, values_list

    def _insert_many_params(self, table, list_document):
        values_list = []
        positioner = []
        for document in list_document:
            document['id'] = cuid()
            keys, values = zip(*document.items())
            positioner.append(tuple(r"%s" for value in values))
            values_list.extend(values)

        positioner = ",".join(self._convert_iter(position) for position in positioner)
        command = 'INSERT INTO "{table}" {keys} VALUES {positioner}'.format(
            table=table,
            keys=self._convert_iter(keys),
            positioner=positioner
        )
        return command, values_list

    def insert_many(self, table, list_document):
        self._check_table(table)
        command, values = self._insert_many_params(table, list_document)
        with self.get_cursor() as cursor:
            cursor.execute(command, values)
        self.commit()
        return [document["id"] for document in list_document]

    def delete(self, table, query):
        self._check_table(table)
        with self.get_cursor() as cursor:
            if query:
                query_string, values = self._query_params(query)
            else:
                query_string = ""

            command_string = 'DELETE FROM "{table}" {query_string}'.format(
                table=table,
                query_string=query_string
            )
            command = cursor.mogrify(command_string, values) if query else command_string
            try:
                cursor.execute(command)
                self.commit()
                return cursor.rowcount
            except (Exception, psycopg2.DatabaseError) as e:
                print(e)

    def _convert_iter(self, iterable):
        string = ""
        for item in iterable:
            string += str(item) + ", "
        string = string.strip(", ")
        return "({})".format(string)

    def _check_table(self, table):
        if table not in self.tables:
            raise Exception('Table {} not in database.'.format(table))

    def connect(self):
        self.connection = self.get_connection()
        self.tables = self.list_tables()

    def close(self):
        self.connection.close()

    def commit(self):
        self.connection.commit()


if __name__ == "__main__":

    h = PostConnect()
    print(h.insert_many("BusinessTag", [{"params": "Hello23", "type": "BUSINESS"}, {
        "params": "Hello25", "type": "BUSINESS"}, {"params": "Hello31", "type": "BUSINESS"}]))
