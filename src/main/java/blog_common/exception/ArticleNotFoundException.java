package blog_common.exception;

public class ArticleNotFoundException extends BaseException  {
    public ArticleNotFoundException(String message) {
        super(message);
    }
    public ArticleNotFoundException() {

    }
}
