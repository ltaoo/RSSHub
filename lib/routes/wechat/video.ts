import { Data, Route, ViewType } from '@/types';
import got from '@/utils/got';
import logger from '@/utils/logger';
import { config } from '@/config';

export const route: Route = {
    path: '/user/video/:username',
    categories: ['social-media', 'popular'],
    view: ViewType.Videos,
    example: '/wechat/user/video/v2_060000231003b20faec8c4e48e1dc3ddcd03ec3cb077bb11b3c6c9a42ee3cea8073a64e6e2bd@finder',
    parameters: { uid: '作者 username，格式为 v2_xxx@finder' },
    features: {
        requireConfig: [
            {
                name: 'TOKEN',
                description: 'The token request wechat_api',
            },
        ],
    },
    radar: [],
    name: '视频号作者详情',
    maintainers: ['ltaoo'],
    handler,
};
async function handler(ctx) {
    const domain = 'https://wxchannel.funzm.com';
    const username = ctx.req.param('username');
    const next_marker = ctx.req.param('next_marker') || '';
    const response = await got(`${domain}/api/media/list?username=${username}&next_marker=${next_marker}&token=${config.wechat.token}`, {});
    const data = response.data as { code: number; msg: string; data: AuthorProfileResp };
    if (data.code) {
        logger.error(JSON.stringify(data.data));
        throw new Error(`Got error code ${data.code} while fetching: ${data.msg}`);
    }
    const profile = data.data;
    const result: Data = {
        title: `${profile.contact.nickname} 的视频号`,
        link: `${domain}/author/?username=${username}`,
        description: `${profile.contact.nickname} 的视频号主页`,
        image: profile.contact.headUrl,
        logo: profile.contact.headUrl,
        icon: profile.contact.headUrl,
        item: (() => {
            if (!Array.isArray(profile.object)) {
                return [];
            }
            const list: Data['item'] = profile.object
                .filter((feed) => {
                    const { objectDesc } = feed;
                    const media = objectDesc.media[0];
                    /** 过滤掉直播记录 */
                    return media.mediaType !== 9;
                })
                .map((feed) => {
                    const { id, objectNonceId, objectDesc, createtime } = feed;
                    const nid = objectNonceId.split('_')[0];
                    const link = `${domain}/player/?oid=${id}&nid=${nid}&embed=1`;
                    const media = objectDesc.media[0];
                    return {
                        guid: id,
                        title: objectDesc.description,
                        image: media.coverUrl,
                        description: (() => {
                            if (!media) {
                                return `${profile.contact.nickname} - ${objectDesc.description}`;
                            }
                            return `<img src="${media.coverUrl}" alt="${objectDesc.description}" /><br />${objectDesc.description}`;
                        })(),
                        pubDate: new Date(createtime * 1000).toUTCString(),
                        link,
                        author: profile.contact.nickname,
                        comments: [],
                    };
                });
            return list;
        })(),
    };
    return result;
}

type AuthorProfileResp = {
    BaseResponse: {
        Ret: number;
        ErrMsg: {
            String: string;
        };
    };
    /** 视频列表 */
    object: {
        id: string;
        nickname: string;
        username: string;
        objectDesc: {
            description: string;
            /** 视频 */
            media: {
                url: string;
                thumbUrl: string;
                mediaType: number;
                videoPlayLen: number;
                width: number;
                height: number;
                md5sum: string;
                fileSize: number;
                bitrate: number;
                /** 规格 */
                spec: {
                    fileFormat: string;
                    firstLoadBytes: number;
                    bitRate: number;
                    codingFormat: string;
                    dynamicRangeType: number;
                    vfps: number;
                    width: number;
                    height: number;
                    durationMs: number;
                    qualityScore: number;
                    videoBitrate: number;
                    audioBitrate: number;
                    levelOrder: number;
                    bypass: string;
                    is3az: number;
                }[];
                coverUrl: string;
                decodeKey: string;
                urlToken: string;
                codecInfo: {
                    videoScore: number;
                    videoCoverScore: number;
                    videoAudioScore: number;
                    thumbScore: number;
                    hdimgScore: number;
                    hasStickers: boolean;
                    useAlgorithmCover: boolean;
                };
                fullCoverUrl: string;
                liveCoverImgs: unknown[];
                scalingInfo: {
                    version: string;
                    isSplitScreen: boolean;
                    isDisableFollow: boolean;
                    upPercentPosition: number;
                    downPercentPosition: number;
                };
                cardShowStyle: number;
                dynamicRangeType: number;
                videoType: number;
                audioSpec: unknown[];
                mediaCdnInfo: {
                    isUsePcdn: boolean;
                    beginUsePcdnBufferSeconds: number;
                    exitUsePcdnBufferSeconds: number;
                    preloadBeginUsePcdnBufferKbytes: number;
                    pcdnTimeoutRetryCount: number;
                    marsPreDownloadKbytes: number;
                    isUseUgcWhenNoPreload: boolean;
                };
                cdnFileSize: number;
            }[];
            mediaType: number;
            extReading: unknown;
            mentionedUser: unknown[];
            feedLocation: {
                productId: unknown[];
                multiLangInfo: unknown[];
            };
            mentionedMusics: unknown[];
            imgFeedBgmInfo: {
                docId: string;
                albumThumbUrl: string;
                name: string;
                artist: string;
                albumName: string;
                mediaStreamingUrl: string;
            };
            followPostInfo: {
                musicInfo: {
                    docId: string;
                    albumThumbUrl: string;
                    name: string;
                    artist: string;
                    albumName: string;
                    mediaStreamingUrl: string;
                    chorusBegin: number;
                    docType: number;
                };
                groupId: string;
                hasBgm: number;
            };
            clientDraftExtInfo: {
                coverWordInfo: unknown[];
                lbsFlagType: number;
                videoMusicId: string;
                needPostATemplateComment: number;
                memberData: {
                    postWithMemberZoneLink: number;
                };
                mjPublisherInfo: {
                    mjPublisherSessionId: string;
                    mjPublisherEntryType: string;
                    isDuetShoot: boolean;
                    mjPublisherExportScene: number;
                    mjPublisherScTemplateTabId: string;
                    mjPublisherScTemplateId: string;
                    mjPublisherScTemplatePosition: number;
                    isScAssetGenerate: boolean;
                    mjPublisherCreationPageId: number;
                    isFromMovieTemplate: number;
                    scTemplateIsFavorite: boolean;
                    mjPublisherTemplateType: number;
                };
                videoSourceType: number;
                feedLongitude: number;
                feedLatitude: number;
                sourceEnterScene: number;
                shootMusicReportInfo: {
                    scene: number;
                };
                editMusicReportInfo: {
                    scene: number;
                };
                coverSelectSource: number;
            };
            generalReportInfo: {
                clientInfo: string;
            };
            posterLocation: {
                city: string;
                productId: unknown[];
                multiLangInfo: unknown[];
            };
            shortTitle: {
                shortTitle: string;
            }[];
            finderNewlifeDesc: {
                secretlyPushChatroomName: unknown[];
                commentEggInfo: unknown[];
                videoTmplInfo: unknown[];
                customCropInfo: unknown[];
            };
            memberData: {
                postWithMemberZoneLink: number;
            };
            modFeedInfo: {
                history: unknown[];
                modifyButtonStatus: number;
            };
        };
        createtime: number;
        likeList: unknown[];
        commentList: unknown[];
        forwardCount: number;
        contact: {
            username: string;
            nickname: string;
            headUrl: string;
            seq: string;
            signature: string;
            followFlag: number;
            coverImgUrl: string;
            spamStatus: number;
            extFlag: number;
            extInfo: {
                sex: number;
            };
            liveStatus: number;
            liveCoverImgUrl: string;
            liveInfo: {
                anchorStatusFlag: string;
                switchFlag: number;
                sourceType: number;
                micSetting: {
                    settingFlag: number;
                    settingSwitchFlag: number;
                };
                lotterySetting: unknown;
                liveCoverImgs: unknown[];
            };
            friendFollowCount: number;
            bindInfo: unknown[];
            menu: unknown[];
            status: string;
            additionalFlag: string;
        };
        recommenderList: unknown[];
        displayid: string;
        likeCount: number;
        commentCount: number;
        deletetime: number;
        objectNonceId: string;
        objectStatus: number;
        sendShareFavWording: string;
        originalFlag: number;
        secondaryShowFlag: number;
        mentionedUserContact: unknown[];
        sessionBuffer: string;
        favCount: number;
        urlValidDuration: number;
        forwardStyle: number;
        permissionFlag: number;
        attachmentList: {
            attachments: unknown[];
        };
        objectType: number;
        friendCommentList: unknown[];
        adFlag: number;
        cookie: string;
        internalFeedbackUrl: string;
        funcFlag: number;
        musicRealtimeInfo: unknown;
        showOriginal: boolean;
        playhistoryInfo: unknown;
        finderPromotionJumpinfo: {
            jumpInfo: {
                jumpinfoType: number;
                wording: string;
                miniAppInfo: {
                    appId: string;
                    path: string;
                    extraData: string;
                };
                style: unknown[];
                supportDeviceList: unknown[];
            };
            wording: string;
            destinationType: number;
        };
        ipRegionInfo: {
            regionText: string;
        };
        objectExtend: {
            favInfo: {
                starFavCount: number;
                fingerlikeFavCount: number;
            };
            preloadConfig: {
                commentIsPreload: boolean;
                commentWaitTime: number;
                commentPreloadBuffer: string;
            };
            advertisementInfo: {
                jumpInfoList: unknown[];
            };
            monotonicData: {
                countInfo: {
                    commentCount: number;
                    likeCount: number;
                    forwardCount: number;
                    readCount: number;
                    favCount: number;
                    versionData: {
                        dataVersion: number;
                        overwrite: boolean;
                    };
                };
                commentCount: {
                    commentCount: number;
                    versionData: {
                        dataVersion: number;
                        overwrite: boolean;
                    };
                };
                globalFavCount: {
                    globalFavCount: number;
                };
            };
            postScene: number;
            finderNewlifeInfo: {
                chatroomPushList: unknown[];
                pictureCropInfo: unknown[];
                followPostInfo: unknown;
            };
            exportId: string;
            friendRecommendCommentInfo: {
                exposeFriends: unknown[];
                myRecommendedCommentList: unknown[];
            };
            adInternalFeedbackUrl: string;
        };
    }[];
    finderUserInfo: {
        coverImgUrl: string;
    };
    contact: {
        username: string;
        nickname: string;
        headUrl: string;
        signature: string;
        followFlag: number;
        coverImgUrl: string;
        spamStatus: number;
        extFlag: number;
        extInfo: {
            sex: number;
        };
        liveStatus: number;
        liveCoverImgUrl: string;
        liveInfo: {
            anchorStatusFlag: string;
            switchFlag: number;
            sourceType: number;
            micSetting: {
                settingFlag: number;
                settingSwitchFlag: number;
            };
            lotterySetting: unknown;
            liveCoverImgs: unknown[];
        };
        bindInfo: unknown[];
        menu: unknown[];
        status: string;
        additionalFlag: string;
    };
    feedsCount: number;
    continueFlag: number;
    lastBuffer: string;
    userTags: string[];
    preloadInfo: {
        preloadStrategyId: number;
        globalInfo: {
            prevCount: number;
            nextCount: number;
            maxBitRate: number;
            preloadFileSizePercent: number;
            preloadFileMinBytes: number;
            preloadMaxConcurrentCount: number;
            megavideoMaxBitRate: number;
            megavideoPrevCount: number;
            megavideoNextCount: number;
            minBufferLength: number;
            maxBufferLength: number;
            minCurrentFeedBufferLength: number;
            minRefreshInterval: number;
            preloadFileTimeMs: number;
            localserverBufferSize: number;
            localserverSendSocketBufferSize: number;
            ffmpegTcpRecvSocketBufferSize: number;
            lastFeedInfoCount: number;
            nextFeedInfoCount: number;
            allowToUseNewSpecMaxPercent: number;
            isBackendControlFindPagePreload: boolean;
            isFindPagePreload: boolean;
            findPagePreloadSecond: number;
            wcplayerSchedulerType: number;
            minStartPlayBufferLengthMs: number;
            findPageEnableCellularPreload: boolean;
            holdoutExptParamSet: {
                holdoutItems: {
                    key: string;
                    value: string;
                    inPriority: boolean;
                }[];
                hitHoldoutExpt: number;
            };
            flowViewPreload: boolean;
            bufferingHealthLengthL0: number;
            bufferingHealthLengthL1: number;
            bufferingHealthLengthL2: number;
            loadWithPlaying: unknown[];
            loadWithPlayWait: unknown[];
            findPagePreloadFeedCount: number;
        };
        objectInfo: {
            feedId: number;
            interestFactor: number;
            loadWithPlaying: unknown[];
        }[];
        megavideoInfo: unknown[];
    };
    liveObjects: unknown[];
    usualTopics: {
        topic: string;
        topicId: string;
    }[];
    liveDurationHours: number;
    eventInfoList: unknown[];
    justWatch: {
        showJustWatch: boolean;
        allowPrefetch: boolean;
    };
    jumpInfo: unknown[];
    deprecatedClubInfo: unknown[];
    anchorStat: {
        totalLiveCount: number;
        recentLiveCount: number;
    };
    ipRegionInfo: {
        regionText: string;
    };
    originalInfo: {
        originalCount: number;
    };
    layoutConfig: {
        tabInfo: {
            tabScene: number;
            layout: {
                layoutType: number;
                rowCount: number;
            }[];
        }[];
    };
    profileBanner: {
        jumpInfo: {
            style: unknown[];
            supportDeviceList: unknown[];
        };
    };
    showInfo: {
        pair: unknown[];
    };
    memberStatus: number;
    upContinueFlag: number;
    upLastbuffer: string;
};
