using my.bookshop as my from '../db/schema';

service CatalogService {
     entity Books as projection on my.Books;

     action updateData(stock: Integer,id:Integer) returns String;
}


