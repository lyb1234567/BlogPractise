package blog_common.exception;

public class AccountNotFoundException extends BaseException  {

    public AccountNotFoundException(String message) {
        super(message);
    }

    public AccountNotFoundException() {

    }
}
