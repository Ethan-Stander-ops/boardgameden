# -------- Build Angular (UI) --------
FROM node:18-alpine AS ui-build
WORKDIR /ui
COPY techno-test/package*.json ./
RUN npm ci
COPY techno-test/ ./
# you said your prod script is "buildProd"
RUN npm run buildProd --if-present || npm run buildProd

# -------- Build .NET (API) --------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS api-build
WORKDIR /src
# copy only the API folder (matches your path: ./boardGameDenAPI)
COPY boardGameDenAPI/ ./boardGameDenAPI/

# auto-detect the csproj under boardGameDenAPI and restore/publish it
RUN set -eux; \
    PROJ="$(find ./boardGameDenAPI -maxdepth 3 -name '*.csproj' -print -quit)"; \
    echo "Using project: $PROJ"; \
    dotnet restore "$PROJ"; \
    dotnet publish "$PROJ" -c Release -o /app/publish

# -------- Runtime image --------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# copy API bits
COPY --from=api-build /app/publish ./

# copy UI build into wwwroot (detect Angular dist subfolder)
COPY --from=ui-build /ui/dist /tmp/dist
RUN set -eux; \
    dist_subdir="$(find /tmp/dist -maxdepth 1 -mindepth 1 -type d | head -n1)"; \
    mkdir -p /app/wwwroot; \
    cp -r "$dist_subdir"/* /app/wwwroot/

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "boardGameDenAPI.dll"]
