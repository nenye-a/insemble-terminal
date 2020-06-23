OPEN_NEWS_TABLE = """
    query OpenNews(
        $openNewsId: String!
    ) {
        openNews (
            openNewsId: $openNewsId
        ) {
            id
            polling
            firstArticle {
                title
                source
                published
                link
            }
            data {
                title
                description
                link
                source
                published
            }
        }
    }
"""
