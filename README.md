# nest-swagger-checker

nest-swagger-checker is a package that validate some specifications about Swagger/OpenApi in NestJs projects.

It has configurable options like checking endpoint summary and description emptiness also same for parameters of endpoint.

## Endpoint Informations Check (@ApiOperation)
nest-swagger-checker can check description and summary of an endpoint by parsing ApiOperation decorator. Also, `pattern` can be provided in configuration to identify rules to standardize every description and summary of endpoints.
```typescript
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

## Endpoint Payload Check ( (@Body | @Query) -> @ApiProperty)
nest-swagger-checker is also able to check fields in ApiProperty decorators. In nestjs we can use ApiProperty decorator to describe informations about endpoint payloads. Paylaods can be defined with @Body or @Query decorators. This flow has recursive structure. 

If some properties of the main payload class has also their own properties, which means they are also classes not primitive types, nsc will check properties of these properties also.

For example there is an custom `Order` class below that used as above endpoints payload by using with @Body decorator. And you can see properties of that class below;
```typescript
export class Order {

  /* nsc checks example, description and type properties in @ApiProperty decorator
  according to your config options. For example this basketId property does not have
  description. So, it will log a warning to termianl when we run nest-swagger-checker */
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
  productIds?: CustomProductClass[]; // nsc also checks ApiProperty decorator of properties in CustomProductClass.

  @ApiProperty({ example: 'Some Description' })
  description: string;

  @ApiProperty({ example: '2021-04-13T00:00:00.000+03:00' })
  orderDate: string;
```
Firstly nest-swagger-checker checks properties of Order class. After that it will check every non-primitive property of Order class. In this case, it will check properties of Status and CustomProductClass classes also.

## Endpoint Param Check (@Param)
nest-swagger-checker can check param of an endpoint like payload. As you knwo, main difference is that param directly comes from endpoints path. So, it has different defining way in NestJs which means nest-swagger-check also different check mechanism about it.

```typescript
@Get(':id')
@ApiParam({
  name: 'id',
  description: 'Order Id',
  example: '5xaer533312312-jkmser21',
})
public async get(
  @Param('id') id: string,
  @Seller() merchant: Merchant,
): Promise<Order> {
  return this.service.getOrder(id);
}
```
According to above case, get endpoint has a param that name with `id`. nest-swagger-will check, if are there any @ApiParam decorator that has same name value with endpoints `id` param. After that it will check description, example etc. fields in @ApiParam decorator according to configuration options.


## Configuratin Options

<details><summary><a href="#"><code>scopes</code></a></summary><ul style="list-style: none">
   <li >
       <details><summary><a href=""><code>file</code></a> </summary> 
        <ul style="list-style: none"> 
             <li><code>pathPattern: src/**/*.ts</code></li>
        </ul>
       </details>
    </li> <!-- End 1 -->
   <li >
    <details><summary><a href=""><code>endpoint</code></a></summary>
    <ul style="list-style: none">
        <details><summary><a href=""><code>summary</code></a> </summary> 
            <ul style="list-style: none"> 
                <li><code>check: true</code></li>
                <li><code>checkEmpty: true</code></li>
                <li><code>pattern: true</code></li>
            </ul>
       </details>
        <details><summary><a href=""><code>description</code></a> </summary> 
            <ul style="list-style: none"> 
                <li><code>check: true</code></li>
                <li><code>checkEmpty: true</code></li>
                <li><code>pattern: true</code></li>
            </ul>
       </details>
        <details><summary><a href=""><code>payload</code></a> </summary> 
            <ul style="list-style: none"> 
                <li><code>check: true</code></li>
                <li>
                    <details><summary><a href=""><code>description</code></a> </summary> 
                        <ul style="list-style: none"> 
                            <li><code>check: true</code></li>
                            <li><code>pattern: ^[A-Z][a-z]*(?:\s[a-z]*)*$ // regex pattern for description of every payload field (optional)</code></li>
                        </ul>
                    </details>
                </li>
                <li>
                    <details><summary><a href=""><code>example</code></a> </summary> 
                        <ul style="list-style: none"> 
                            <li><code>check: true</code></li>
                        </ul>
                    </details>
                </li>
                <li>
                    <details><summary><a href=""><code>type</code></a> </summary> 
                        <ul style="list-style: none"> 
                            <li><code>check: true // check type property in ApiProperty decorators for every field of endpoint payload</code></li>
                        </ul>
                    </details>
                </li>
            </ul>
       </details>
        <details><summary><a href=""><code>params</code></a> </summary> 
            <ul style="list-style: none"> 
                <li><code>check: true</code></li>
                <li>
                    <details><summary><a href=""><code>description</code></a> </summary> 
                        <ul style="list-style: none"> 
                            <li><code>check: true</code></li>
                            <li><code>pattern: ^[A-Z][a-z]*(?:\s[a-z]*)*$ // regex pattern for description of every endpoint param (optional)</code></li>
                        </ul>
                    </details>
                </li>
                <li>
                    <details><summary><a href=""><code>example</code></a> </summary> 
                        <ul style="list-style: none"> 
                            <li><code>check: true</code></li>
                        </ul>
                    </details>
                </li>
            </ul>
       </details>

   </ul>
    </details>
    </li> 
   </ul> 
  </details>

## Usage

Firstly, you need to install nest-swagger-package with your package manager e.g yarn or npm.

If you create `.swautomaterc` file in your projects root folder you can override default configuration options with your choices. You don't need to identify every option in that file. Just use same hieararchy with same values. 

You can run `nest-swagger-checker` command in terminal. It will check every file that matched with file pattern if file includes controller class. 

You can give filePattern in custom config file or you can run command like `nest-swagger-checker src/myCustomPath/myCustomFile`. So yes, you can give your pattern with command.

### Usage Idea
You can check every file in pre-commit stage with husky package. I don't tell details of husky package, but after installation of husky, we can call nest-swagger-checker command for every files that will be committed before commit.

```bash
files=$(git diff --name-only)
for file in $files; do
        nest-swagger-checker $file
done
```

