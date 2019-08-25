## Spigot Minecraft Server 

Built off the cloudron Minecraft app package, but instead builds and installs Spigot.

### To Install (Quick):

```bash
cloudron login
git clone https://github.com/mitchellurgero/spigot-app
cd spigot-app
cloudron install --image mitchellurgero/org.urgero.spigot:latest
```

### To Install (Long):

Make sure to edit as needed:

```bash
cloudron login
git clone https://github.com/mitchellurgero/spigot-app
cd spigot-app
docker build --no-cache -t yourDockerHubUser/package.name:tagname .
docker push yourDockerHubUser/package.name:tagname
cloudron install --image yourDockerHubUser/package.name:tagname
```