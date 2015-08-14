# HTML5MusicPlayer

### 在线演示地址：http://backgroudmusic.sinaapp.com/audio.html

### 申明：
1. 播放器部分后台代码为朱晓鸣老师微信开发教程中的demo，感谢朱老师的分享。
2. 示例中所有音乐资源均来自网易云音乐，版权归云音乐及各自音乐人所有。

### tastList：

1. 重构播放器结构，模仿网易云音乐播放器风格;
2. 增加歌词显示;
3. 增加播放进度控制;
4. 增加音量控制；
5. 增加播放器动画;
6. 修复缓存加载错误问题;
7. 修复歌手信息无法获取问题。

### @TODO:

1. **判定媒体内容加载情况时在IE下无效，导致缓存进度在IE无法显示;不同浏览器、网络状况下仍旧会出现不可预见问题。**

   * 错误信息：`Failed to execute 'end' on 'TimeRanges': The index provided (0) is greater than or equal to the maximum bound (0)`
 
   * 处理：
 	
 		开始时把更新缓存进度的函数绑定到progress事件，希望借助progress的不断触发来实现缓存条更新，结果会显示如上错误。
 
 		于是把`obj.buffered.end(0)`打印了一下，发现并不是会一直报错，当音乐播放一段时间后可以输出结果。感觉问题出在了事件触发的时间上。在一开始触发progress时，此时还没有进行缓冲，`buffer.end(0)`是无法获取的，所有才会出现如上错误。
 
 		在audio所有事件中，除了progress就只有timeupdate是会不停触发的，但timeupdate是与currentTime相关的，更适合用于播放条的更新而不是缓冲条;还有一种办法就是利用setInterval不停地调用缓冲更新函数，但这样就跟audio的事件没有任何关联了...

  		之所以出问题是因为在前期触发progress时没有缓冲，那么可以在调用更新缓冲函数前加一个判断，让它只有在可以获取`buffered.end(0)`时才调用。
  
  		audio的readyState属性指定的是当前已经加载的媒体内容，可以通过它的值来进行判断，在readyState值为0或1时，是没有加载媒体内容的，所以要在其后才可以调用更新缓存函数。在调用更新缓冲函数前加一个if判断来判断下readyState就可以了。
  
 		 ```
              if (obj.readyState !== 0 && obj.readyState !== 1) {
                onSoundBuffering();
            }
 		 ```
  
  		这样便不会报错了，但是在Chrome下还是有一些奇怪的现象，打印readyState会发现有些时候莫名出现一连串0，明明已经开始播放了，readyState一直是0是什么鬼？(貌似是在歌曲已经播放过一次，本地已经有缓存的时候出现的多)
 

 
2. **暂停时无法保持动画当前位置，尝试animation-play-state：pause 暂停动画，但元素样式还是也会回到原始状态。**

3. **页面布局方面比较仓促，由于核心是在js上，所有布局方面没有考虑太多，响应式这一块做的比较爆炸，只是应用了一些简单的media query，还有待完善。**

4. **歌词数据前的莫名字段无法显示：** 
	* 问题
		
		> 今天无意间随便点了首个,结果发现歌词前面竟然有一些奇怪的字段
	
		```
		[ti:le papillon] [ar:nicolas err ra] [00:14.512]Pourquoi les poules pondent des oeufs? [00:18.563]Pour que les oeufs fassent des poules. [00:21.264]Pourquoi les amoureux s ’embrassent? 
		```
	
		这是什么鬼?爆炸啊,处理歌词的时候是按照`[时间]XXXX`处理的;`[ti:le papillon]`是我搜的歌的名字，但是这些信息通常也是要跟在时间后面，像这样:

		`[00:00.00] 作曲 : 叶圣涛 [00:01.00] 作词 : 吴梦知 [00:03.240]曹格 :宝贝 跟爸爸一起唱歌哦 [00:05.880]Joe&Grace :Ok [00:07.690]曹格 :啦啦啦 啦啦啦 啦啦啦啦啦 `

		果然，一首歌包含太多数据，怪不得抓的云音乐一首歌的JSON对象要几百行。

	* 可行的解决办法：
		
		可以跟上面的《爸爸去哪儿》那首歌一样，先判定歌词数据是不是以`[XX:XX.XX]`开头，如果不是就在前面添加`[00:00.00]`,然后把那些莫名字段赋给这个时间点。

		不过这样还是有问题的，像`[ti:le papillon] [ar:nicolas err ra]`这样简短的字段可以采用上面的方法，可是如果莫名字段字符很多的话`[00:00.00]`这一个时间点是根本显示不过来的。

		幸好随机找了几首歌发现前面的莫名字段都不会很长，不过没用发现并不代表没有这种可能性，看来有时间还得好好分析云音乐的歌曲信息。


### 一些收获（所有结论皆是在网络状态良好（20M宽带）下得出）：
1. 关于readyState：

   	Chrome通常会在加载第一首歌曲时才会有0值，而后切换歌曲时直接跳转4值;而Firefox在播放每首歌曲时都会存在0值，而后调至4值。
   在网速良好时，二者的readyState都不会存在1/2/3值。

2. 关于HVAE_ENOUGH_DATA：
   
   	官方对HVAE_ENOUGH_DATA的描述为：所有媒体内容都已经加载完毕，但Chrome与Firefox貌似并没有这样处理，二者都会在缓冲内容未未到1    00%时将readyState值变为4。

3. 关于progress：
   
   	官方描述中称此事件会每秒触发2~8次，在Chrome中，当加载足够内容时，progress会停止，然后触发suspend，暂时停止下载;而Firefox似乎比较心急，当前一首歌曲播放时，后面的歌曲会直接缓冲完毕，也就是说并没有像Chrome一样触发suspend,暂停下载，而是一口气缓冲完。
