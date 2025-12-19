# From official instructions on how to set up a Docker container on
# https://learn.microsoft.com/en-us/dotnet/core/docker/build-container?tabs=linux&pivots=dotnet-10-0
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS base
WORKDIR /app

# Copy only the project file with the dependencies before copying the rest of the project
COPY *.csproj ./
# This way, the dependencies will only be restored from a cache instead of re-downloading them
RUN dotnet restore

COPY . ./

FROM base AS development
EXPOSE 5081
ENTRYPOINT  ["dotnet", "watch", "--urls", "http://0.0.0.0:5081"]

FROM base AS builder
RUN dotnet publish -c Debug -o out

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS production
WORKDIR /app
COPY --from=builder /app/out .
EXPOSE 5081
ENTRYPOINT [ "dotnet", "DotNet.Docker.dll" ]
