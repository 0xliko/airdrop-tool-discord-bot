const {MessageAttachment, MessageEmbed, Client, Intents,Collection} = require('discord.js');
const express = require('express');
const axios = require('axios');
const {resolveImage, Canvas} = require("canvas-constructor/cairo")
const Keyv = require('keyv');
const db = new Keyv('sqlite://./storage/database.sqlite');
db.on('error', err => console.log('Connection Error', err));
const {
    token,
    prefix,
    verifyRoleId,
    website
} = require('./config.json')
let canvax = require('canvas')
canvax.registerFont("./storage/Uni Sans Heavy.otf", {family: 'Discord'})
canvax.registerFont("./storage/DejaVuSansCondensed-Bold.ttf", {family: 'Discordx'})

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES]
}) // Declare client to be a new Discord Client (bot)

/*
Code Below provides info about the bot
once it's ready
*/
client.once("ready", async () => {
    // command create code, now not used
    /*client.guilds.cache.each(guild=>{
        client.application.commands.create({name:'join',description:'This command is for join to server'},guild.id)
            .then(console.log).catch(console.error)
        client.application.commands.create({name:'claim',description:'This command will claim airdrop to user!'},guild.id)
            .then(console.log).catch(console.error);
    })*/
    console.log(`[STATUS] ${client.user.tag} is now online!\n[INFO] Bot by ZeroSync https://www.youtube.com/c/ZeroSync\n[INFO] Bot serving on Ready to serve in ${client.guilds.cache.size} servers\n[INFO] Bot serving ${client.users.cache.size} users\n[Invite Link] https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`)
});

/*
  Get user's invite count
*/
async function getUserInviteCount(userid){
    return new Promise(async  (resolve,reject) => {
        client.guilds.cache.each(async guild=>{
            let invites = await guild.invites.fetch();
            let inviteCounts = invites.filter(invite=>invite.inviter.id==userid)
                .map(invite=>invite.uses)
            resolve(inviteCounts.length? inviteCounts.reduce((a,b)=>a+b):0)
        })
    })
}
/*
Client when detects a message
then execute the code
*/

client.on("messageCreate", async message => {
    if (message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    let member = await message.guild.members.fetch(message.author);
    let channelName = message.channel.name;
    let hasRole = member.roles.cache.filter(role=>{
        return role.name == 'verified';
    }).size;
    if (!message.content.startsWith(prefix) && message.channel.name == 'join') {
        const dm = await member.createDM();
        let embed = new MessageEmbed()
            .setTitle(`Invalid Command`)
            .setDescription(`On join channel, only !join command is valid command`)
            .setColor('#2F3136')
            .setThumbnail(member.displayAvatarURL({
                dynamic: true
            }))
            .setTimestamp()
        //.setFooter('Invalid message!')
        await message.delete();
        dm.send({embeds:[embed]}).then(()=>{

        })
        return
    }

    if(channelName == 'join') {
        if (command === "join") {
            const dm = await member.createDM();
            if(hasRole){
                let embed = new MessageEmbed()
                    .setTitle(`Welcome to ${member.guild.name}`)
                    .setDescription(`Already you was joined.`)
                    .setColor('#2F3136')
                    .setThumbnail(member.displayAvatarURL({
                        dynamic: true
                    }))
                    .setTimestamp()
                    .setFooter('Already Validated!')
                dm.send({ embeds: [embed]}).then(console.log).catch(console.error)
                await message.delete();
            }else {
                let embed = new MessageEmbed()
                    .setTitle(`Welcome to ${member.guild.name}`)
                    .setDescription(`Welcome To Our Server ${member.user} we are happy to have you!\n 
                Please visit  [our website](https://website.com/validate?id=${member.user.id}) to validate your account!`)
                    .setColor('#2F3136')
                    .setThumbnail(member.displayAvatarURL({
                        dynamic: true
                    }))
                    .setTimestamp()
                    .setFooter('Thanks For Joining!')
                dm.send({ embeds: [embed]}).then(console.log).catch(console.error)
            }

        }
        else{
                const dm = await member.createDM();
                let embed = new MessageEmbed()
                .setTitle(`Invalid Command`)
                .setDescription(`On join channel, only !join command is valid command`)
                .setColor('#2F3136')
                .setThumbnail(member.displayAvatarURL({
                    dynamic: true
                }))
                .setTimestamp()
                //.setFooter('Invalid message!')
                await message.delete();
                dm.send({embeds:[embed]}).then(()=>{

                })
        }
        return;
    }
    if (command === "claim" && message.content.startsWith(prefix)) {
        let data = JSON.stringify({"userid":`${member.user.id}`});
        let config = {
            method: 'post',
            url: `${website}/api/airdrop`,
            headers: {
                'Content-Type': 'application/json'
            },
            data:data
        };

        axios(config)
            .then(function (response) {
                if(response.data.success){
                    let embed = new MessageEmbed()
                        .setTitle(`Claim`)
                        .setDescription(`${member.user.username} claimed!`)
                        .setColor('#2F3136')
                        .setThumbnail(member.displayAvatarURL({
                            dynamic: true
                        }))
                        .setTimestamp()
                        .setFooter('Thanks For Claim!')

                    message.reply({ embeds: [embed]}).then(console.log).catch(console.error)
                } else{
                    let embed = new MessageEmbed()
                        .setTitle(`Claim Error`)
                        .setDescription(`Got error while ${member.user.username} claim`)
                        .setColor('#2F3136')
                        .setThumbnail(member.displayAvatarURL({
                            dynamic: true
                        }))
                        .setTimestamp()
                        .setFooter('Sorry For Error!')

                    message.reply({ embeds: [embed]}).then(console.log).catch(console.error)
                }
            })
            .catch(function (error) {
                let embed = new MessageEmbed()
                    .setTitle(`Claim Error`)
                    .setDescription(`Got error while ${member.user.username} claim`)
                    .setColor('#2F3136')
                    .setThumbnail(member.displayAvatarURL({
                        dynamic: true
                    }))
                    .setTimestamp()
                    .setFooter('Sorry For Error!')
                message.reply({ embeds: [embed]}).then(console.log).catch(console.error)
            });

    }
    if (command === "points" && message.content.startsWith(prefix)) {
        const count = await getUserInviteCount(member.user.id);
        let embed = new MessageEmbed()
            .setTitle(`${member.user.username}'s point`)
            .setDescription(`
                ${member.user.username} invited ${count} people
                ${member.user.username} got ${count*10} points  
            `)
            .setColor('#2F3136')
            .setThumbnail("https://cdn.shopify.com/s/files/1/2703/8128/products/ER110140_Blue_Round_Earring_Finest_1_18k_White_1_x1280.jpg?v=1629210442")
            .setTimestamp()
            //.setFooter('Thanks For Joining!')

        message.reply({ embeds: [embed]}).then(console.log).catch(console.error)
    }
});

/*
Client when detects
a new member join
*/
client.on('guildMemberAdd', async member => {
})

/*
 Generate canvas function, for attached images.
*/
async function generateCanvas(member) {
    const avatar = await resolveImage(member.user.displayAvatarURL({ 'size': 2048, 'format': "png" }))
    const { weirdToNormalChars } = require('weird-to-normal-chars')
    const name = weirdToNormalChars(member.user.username)
    let canvas = new Canvas(1024, 450)
        .setColor("#2F3136")
        .printCircle(512, 155, 120)
        .printCircularImage(avatar, 512, 155, 115)
        .setTextAlign('center')
        .setTextFont('70px Discord')
        .printText(`Welcome`, 512, 355)
        .setTextAlign("center")
        .setColor("#FFFFFF")
        .setTextFont('45px Discordx')
        .printText(`${name}`, 512, 395)
        .setTextAlign("center")
        .setColor("#FFFFFF")
        .setTextFont('30px Discord')
        .printText(`To ${member.guild.name}`, 512, 430)
    return canvas.toBufferAsync()
}

/*
  http service.
*/
const app = express()
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.post('/api/validate', async function (req, res) {
    let userid = req.body.userid;

    if(client.isReady()){
            let guild = client.guilds.cache.at(0);
            let member = await guild.members.fetch(userid)
            guild.roles.fetch(verifyRoleId).then(role=>{
                member.edit({roles: [role]}).then(async ()=>{
                    res.json({success: true});
                    const dm = await member.createDM();
                    let embed = new MessageEmbed()
                            .setTitle(`Welcome validation`)
                            .setDescription(`
                               You are validated!
                               You will get one point if you invite other people.
                               Right click on server icon, and click invite people button.
                               Once someone joined to out server with link which you shared, you will get one point
                               With !points command,you will get current point. 
                               With !claim command,you will get airdrop 
                             `)
                            .setColor('#2F3136')
                            .setThumbnail("https://www.animatedimages.org/data/media/707/animated-welcome-image-0151.gif")
                            .setTimestamp()
                            .setFooter('Validation Message')
                        dm.send({ embeds: [embed]}).then(console.log).catch(console.error)
                }).catch(err=>{
                    res.json({success: false,msg:err.message});
                })
            }).catch(err=>{
                res.json({success: false,msg:err.message});
            })
    } else {
        res.json({success: false,msg:'bot is not running!'});
    }
})
/*
 Simulation website airdrop endpoint
 */
app.post('/api/airdrop', async function (req, res) {
    res.json({success: true});
})

app.listen(process.env.PORT || 3000)
client.login(token)



