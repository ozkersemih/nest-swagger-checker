# nest-swagger-checker

nest-swagger-checker is a package that validate some specifications about Swagger/OpenApi in NestJs projects.

It has configurable options like checking endpoint summary and description emptiness also same for parameters of endpoint.

```
  @Post('')
  /* nest-swagger-checker can check whether summary is empty or not in ApiOperation decorator.
  Also it can check that summary matches or not with given regular expression pattern. */
  @ApiOperation({
    summary: 'Create Order',
    description: 'Creating order endpoint description',
  })
  ...
  public async createOrder(
    @Body() createBody: Order,
  ): Promise<CustomResponseType> {
    .....
  }
```

nest-swagger-checker is also able to check fields in ApiProperty decorators. In nestjs we can use ApiProperty decorator to describe informations about endpoint payloads(they can define with @Body or @Query decorators)

For example there is an custom `Order` class below that used as above endpoints payload;
```
export class Order {
  @ApiProperty({ example: '44c4b0ae-1397-11eb-adc1-0242ac120002' })
  basketId: string;

  @ApiProperty({
    example: [{ date: '1997-07-16T19:20:30.45+01:00', status: 'PAID' }],
  })
  statuses: Status[];

  @ApiProperty({
    example: [
      {
        id: 60485482,
        description: '',
      },
    ],
  })
  productIds?: CustomProductClass[]; // nest-swagger-checker also checks ApiProperty decorator of properties in CustomProductClass.

  @ApiProperty({ example: 'Some Description' })
  description: string;

  @ApiProperty({ example: '2021-04-13T00:00:00.000+03:00' })
  orderDate: string;
```
nest-swagger-checker has recursive structure to check complex classes.
As you can see above, it also goes CustomProductClass and checks properties of it about ApiProperty decorator.
