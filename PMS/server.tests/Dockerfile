FROM mcr.microsoft.com/dotnet/sdk:10.0 AS test
WORKDIR /app

#
#   Since the test project references the main project, copy both of them
#   1) Install the dependencies first
#   2) Copy the project code
#
COPY ./server/PMS.csproj .
COPY ./server.tests/server.tests.csproj server.tests
RUN dotnet restore "server.tests/server.tests.csproj"

COPY . .
WORKDIR /app/server.tests

CMD [ "dotnet", "test" ]